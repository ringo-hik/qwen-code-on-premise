/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelManager, ModelServerConfig, ModelSelectionOptions } from '../utils/modelManager.js';
import { Config } from '../config/config.js';
import { DEFAULT_GEMINI_MODEL, DEFAULT_GEMINI_FLASH_MODEL } from '../config/models.js';

/**
 * 모델 선택 결과
 */
export interface ModelSelectionResult {
  serverId: string;
  serverName: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
  isInternal: boolean;
  fallbackModel?: string;
}

/**
 * 모델 선택 서비스
 * 기존 Gemini 모델과 내부 LLM 서버들을 통합 관리
 */
export class ModelSelectionService {
  private modelManager: ModelManager;
  private fallbackChain: string[] = [];

  constructor(private config: Config) {
    this.modelManager = new ModelManager({
      autoHealthCheck: true,
      healthCheckInterval: 60000 // 1분마다 체크
    });
    
    // 기본 장애조치 체인 설정
    this.fallbackChain = [
      'local-qwen',
      'internal-llm-1', 
      'internal-llm-2',
      'gemini-fallback'
    ];
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    await this.modelManager.loadConfig();
    await this.modelManager.checkAllServersHealth();
    console.log('🔄 Model selection service initialized');
  }

  /**
   * 최적 모델 선택
   */
  async selectModel(options: ModelSelectionOptions = {}): Promise<ModelSelectionResult | null> {
    // 1. 사용자가 선호하는 모델이 있는지 확인
    const configuredModel = this.config.getModel();
    
    // 2. 내부 LLM 서버 중에서 최적 선택
    const internalServer = this.modelManager.selectBestServer({
      ...options,
      capability: options.capability || 'chat'
    });

    if (internalServer) {
      return {
        serverId: internalServer.id,
        serverName: internalServer.name,
        baseUrl: internalServer.baseUrl,
        model: internalServer.model,
        apiKey: internalServer.apiKey,
        isInternal: true
      };
    }

    // 3. 내부 서버가 없으면 Gemini 모델로 폴백
    console.log('⚠️ No healthy internal servers found, falling back to Gemini models');
    
    return {
      serverId: 'gemini-fallback',
      serverName: 'Gemini API',
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: configuredModel || DEFAULT_GEMINI_MODEL,
      isInternal: false,
      fallbackModel: DEFAULT_GEMINI_FLASH_MODEL
    };
  }

  /**
   * 특정 기능을 위한 모델 선택
   */
  async selectModelForCapability(capability: string): Promise<ModelSelectionResult | null> {
    return this.selectModel({ capability });
  }

  /**
   * 장애조치 모델 선택
   */
  async selectFallbackModel(excludeServers: string[] = []): Promise<ModelSelectionResult | null> {
    // 제외할 서버를 고려하여 장애조치 체인에서 선택
    const availableServers = this.fallbackChain.filter(serverId => 
      !excludeServers.includes(serverId)
    );

    for (const serverId of availableServers) {
      if (serverId === 'gemini-fallback') {
        return {
          serverId: 'gemini-fallback',
          serverName: 'Gemini API (Fallback)',
          baseUrl: 'https://generativelanguage.googleapis.com',
          model: DEFAULT_GEMINI_FLASH_MODEL,
          isInternal: false
        };
      }

      const server = this.modelManager.getServers().find(s => s.id === serverId);
      if (server && server.isActive) {
        const status = this.modelManager.getServerStatus(serverId);
        if (status?.isHealthy) {
          return {
            serverId: server.id,
            serverName: server.name,
            baseUrl: server.baseUrl,
            model: server.model,
            apiKey: server.apiKey,
            isInternal: true
          };
        }
      }
    }

    return null;
  }

  /**
   * 모델 서버 추가
   */
  addModelServer(server: ModelServerConfig): void {
    this.modelManager.addServer(server);
  }

  /**
   * 모델 서버 제거
   */
  removeModelServer(serverId: string): boolean {
    return this.modelManager.removeServer(serverId);
  }

  /**
   * 서버 목록 조회
   */
  getModelServers(): ModelServerConfig[] {
    return this.modelManager.getServers();
  }

  /**
   * 건강한 서버 목록 조회
   */
  getHealthyServers(): ModelServerConfig[] {
    return this.modelManager.getHealthyServers();
  }

  /**
   * 모든 서버 상태 확인
   */
  async checkAllServersHealth(): Promise<void> {
    await this.modelManager.checkAllServersHealth();
  }

  /**
   * 서버 상태 조회
   */
  getServerStatus(serverId: string) {
    return this.modelManager.getServerStatus(serverId);
  }

  /**
   * 통계 정보 조회
   */
  getStats() {
    return this.modelManager.getStats();
  }

  /**
   * 설정 저장
   */
  async saveConfig(): Promise<void> {
    await this.modelManager.saveConfig();
  }

  /**
   * 장애조치 체인 설정
   */
  setFallbackChain(chain: string[]): void {
    this.fallbackChain = chain;
    console.log(`🔄 Fallback chain updated: ${chain.join(' → ')}`);
  }

  /**
   * 자동 발견된 서버 추가
   */
  async addDiscoveredServer(baseUrl: string, model?: string): Promise<string> {
    const serverId = `discovered-${Date.now()}`;
    const server: ModelServerConfig = {
      id: serverId,
      name: `Discovered Server (${baseUrl})`,
      baseUrl: baseUrl,
      model: model || 'auto-detected-model',
      priority: 99, // 낮은 우선순위
      isActive: true,
      capabilities: ['chat', 'completion'],
      description: 'Automatically discovered server'
    };

    this.modelManager.addServer(server);
    
    // 상태 확인
    await this.modelManager.checkServerHealth(serverId);
    
    console.log(`✅ Added discovered server: ${baseUrl}`);
    return serverId;
  }

  /**
   * 현재 활성 모델 정보 조회
   */
  async getCurrentModelInfo(): Promise<{
    model: string;
    isInternal: boolean;
    serverInfo?: ModelServerConfig;
    status?: 'healthy' | 'unhealthy' | 'unknown';
  }> {
    const selection = await this.selectModel();
    
    if (!selection) {
      return {
        model: this.config.getModel() || DEFAULT_GEMINI_MODEL,
        isInternal: false,
        status: 'unknown'
      };
    }

    if (selection.isInternal) {
      const server = this.modelManager.getServers().find(s => s.id === selection.serverId);
      const status = this.modelManager.getServerStatus(selection.serverId);
      
      return {
        model: selection.model,
        isInternal: true,
        serverInfo: server,
        status: status?.isHealthy ? 'healthy' : 'unhealthy'
      };
    }

    return {
      model: selection.model,
      isInternal: false,
      status: 'healthy' // Gemini API는 기본적으로 건강하다고 가정
    };
  }

  /**
   * 정리 작업
   */
  destroy(): void {
    this.modelManager.destroy();
  }
}