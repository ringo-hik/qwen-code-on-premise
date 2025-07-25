/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { homedir } from 'os';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';

/**
 * 모델 서버 설정 인터페이스
 */
export interface ModelServerConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
  priority: number; // 1=highest, 100=lowest
  isActive: boolean;
  healthCheckUrl?: string;
  capabilities?: string[]; // ['chat', 'embedding', 'completion']
  maxTokens?: number;
  description?: string;
}

/**
 * 서버 상태 정보
 */
export interface ServerStatus {
  id: string;
  isHealthy: boolean;
  responseTime: number;
  lastChecked: Date;
  error?: string;
  capabilities?: string[];
}

/**
 * 모델 선택 옵션
 */
export interface ModelSelectionOptions {
  capability?: string; // 'chat', 'embedding', 'completion'
  maxTokens?: number;
  preferredServerId?: string;
  excludeServers?: string[];
}

/**
 * 모델 관리자 클래스
 * 다중 LLM 서버 지원, 자동 장애조치, 부하 분산 기능 제공
 */
export class ModelManager {
  private servers: Map<string, ModelServerConfig> = new Map();
  private serverStatus: Map<string, ServerStatus> = new Map();
  private configPath: string;
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30초마다 상태 확인
  private readonly REQUEST_TIMEOUT = 5000; // 5초 타임아웃

  constructor(
    private options: {
      configDir?: string;
      autoHealthCheck?: boolean;
      healthCheckInterval?: number;
    } = {}
  ) {
    const configDir = options.configDir || path.join(homedir(), '.qwen');
    this.configPath = path.join(configDir, 'models.json');
    
    if (options.autoHealthCheck !== false) {
      this.startHealthCheck(options.healthCheckInterval || this.HEALTH_CHECK_INTERVAL);
    }
  }

  /**
   * 설정 로드
   */
  async loadConfig(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(configData);
        
        if (config.servers && Array.isArray(config.servers)) {
          this.servers.clear();
          config.servers.forEach((server: ModelServerConfig) => {
            this.servers.set(server.id, server);
          });
          console.log(`✅ Loaded ${this.servers.size} model servers from config`);
        }
      } else {
        // 기본 설정 생성
        await this.createDefaultConfig();
      }
    } catch (error) {
      console.error('❌ Failed to load model config:', error);
      await this.createDefaultConfig();
    }
  }

  /**
   * 기본 설정 파일 생성
   */
  private async createDefaultConfig(): Promise<void> {
    const defaultServers: ModelServerConfig[] = [
      {
        id: 'local-qwen',
        name: 'Local Qwen Server',
        baseUrl: 'http://localhost:8443/api/v1',
        model: 'qwen3-coder-max',
        priority: 1,
        isActive: true,
        capabilities: ['chat', 'completion'],
        maxTokens: 32768,
        description: 'Local Qwen Coder model server'
      },
      {
        id: 'internal-llm-1',
        name: 'Internal LLM Server 1',
        baseUrl: 'http://localhost:8080/api/v1',
        model: 'internal-llm-model',
        priority: 2,
        isActive: true,
        capabilities: ['chat', 'completion'],
        maxTokens: 16384,
        description: 'Internal LLM server instance 1'
      },
      {
        id: 'internal-llm-2',
        name: 'Internal LLM Server 2',
        baseUrl: 'http://localhost:3000/api/v1',
        model: 'internal-llm-model',
        priority: 3,
        isActive: true,
        capabilities: ['chat', 'completion'],
        maxTokens: 16384,
        description: 'Internal LLM server instance 2'
      }
    ];

    const config = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      servers: defaultServers
    };

    // 디렉토리 생성
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
    
    // 메모리에 로드
    defaultServers.forEach(server => {
      this.servers.set(server.id, server);
    });

    console.log(`📁 Created default model configuration: ${this.configPath}`);
  }

  /**
   * 설정 저장
   */
  async saveConfig(): Promise<void> {
    try {
      const config = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        servers: Array.from(this.servers.values())
      };

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log('✅ Model configuration saved');
    } catch (error) {
      console.error('❌ Failed to save model config:', error);
      throw error;
    }
  }

  /**
   * 모델 서버 추가
   */
  addServer(server: ModelServerConfig): void {
    this.servers.set(server.id, server);
    console.log(`✅ Added model server: ${server.name} (${server.id})`);
  }

  /**
   * 모델 서버 제거
   */
  removeServer(serverId: string): boolean {
    const removed = this.servers.delete(serverId);
    this.serverStatus.delete(serverId);
    if (removed) {
      console.log(`✅ Removed model server: ${serverId}`);
    }
    return removed;
  }

  /**
   * 모델 서버 목록 조회
   */
  getServers(): ModelServerConfig[] {
    return Array.from(this.servers.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * 활성 서버 목록 조회
   */
  getActiveServers(): ModelServerConfig[] {
    return this.getServers().filter(server => server.isActive);
  }

  /**
   * 건강한 서버 목록 조회
   */
  getHealthyServers(): ModelServerConfig[] {
    return this.getActiveServers().filter(server => {
      const status = this.serverStatus.get(server.id);
      return status?.isHealthy === true;
    });
  }

  /**
   * 서버 상태 확인
   */
  async checkServerHealth(serverId: string): Promise<ServerStatus> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    const startTime = Date.now();
    const status: ServerStatus = {
      id: serverId,
      isHealthy: false,
      responseTime: -1,
      lastChecked: new Date(),
      capabilities: server.capabilities
    };

    try {
      const testUrl = `${server.baseUrl}/chat/completions`;
      const testData = JSON.stringify({
        model: server.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1
      });

      const isHealthy = await this.testServerConnection(testUrl, testData, server.apiKey);
      const responseTime = Date.now() - startTime;

      status.isHealthy = isHealthy;
      status.responseTime = responseTime;

      if (isHealthy) {
        console.log(`✅ Server ${serverId} is healthy (${responseTime}ms)`);
      } else {
        status.error = 'Connection failed';
        console.log(`❌ Server ${serverId} is unhealthy`);
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Server ${serverId} health check failed: ${status.error}`);
    }

    this.serverStatus.set(serverId, status);
    return status;
  }

  /**
   * 서버 연결 테스트
   */
  private async testServerConnection(
    url: string,
    testData: string,
    apiKey?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData).toString()
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const req = client.request(url, {
        method: 'POST',
        headers,
        timeout: this.REQUEST_TIMEOUT,
        ...(isHttps && { rejectUnauthorized: false }),
      }, (res) => {
        // 200이나 400번대도 서버가 응답한다면 건강한 것으로 간주
        const isHealthy = res.statusCode !== undefined && 
                         res.statusCode >= 200 && 
                         res.statusCode < 500;
        resolve(isHealthy);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.write(testData);
      req.end();
    });
  }

  /**
   * 모든 서버 상태 확인
   */
  async checkAllServersHealth(): Promise<ServerStatus[]> {
    const servers = this.getActiveServers();
    const healthChecks = servers.map(server => this.checkServerHealth(server.id));
    return Promise.all(healthChecks);
  }

  /**
   * 최적 서버 선택
   */
  selectBestServer(options: ModelSelectionOptions = {}): ModelServerConfig | null {
    let candidates = this.getHealthyServers();

    // 기능별 필터링
    if (options.capability) {
      candidates = candidates.filter(server => 
        server.capabilities?.includes(options.capability!)
      );
    }

    // 토큰 수 필터링
    if (options.maxTokens) {
      candidates = candidates.filter(server => 
        !server.maxTokens || server.maxTokens >= options.maxTokens!
      );
    }

    // 선호 서버 확인
    if (options.preferredServerId) {
      const preferred = candidates.find(server => server.id === options.preferredServerId);
      if (preferred) {
        return preferred;
      }
    }

    // 제외 서버 필터링
    if (options.excludeServers?.length) {
      candidates = candidates.filter(server => 
        !options.excludeServers!.includes(server.id)
      );
    }

    if (candidates.length === 0) {
      return null;
    }

    // 우선순위와 응답시간을 기반으로 선택
    return candidates.sort((a, b) => {
      const statusA = this.serverStatus.get(a.id);
      const statusB = this.serverStatus.get(b.id);
      
      // 우선순위 먼저 비교
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // 응답시간으로 비교
      const responseTimeA = statusA?.responseTime || Infinity;
      const responseTimeB = statusB?.responseTime || Infinity;
      return responseTimeA - responseTimeB;
    })[0];
  }

  /**
   * 서버 상태 모니터링 시작
   */
  private startHealthCheck(interval: number): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkAllServersHealth();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, interval);

    console.log(`🔄 Started health monitoring (interval: ${interval}ms)`);
  }

  /**
   * 서버 상태 모니터링 중지
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      console.log('⏹️ Stopped health monitoring');
    }
  }

  /**
   * 서버 상태 조회
   */
  getServerStatus(serverId: string): ServerStatus | undefined {
    return this.serverStatus.get(serverId);
  }

  /**
   * 모든 서버 상태 조회
   */
  getAllServerStatus(): ServerStatus[] {
    return Array.from(this.serverStatus.values());
  }

  /**
   * 서버 활성화/비활성화
   */
  setServerActive(serverId: string, isActive: boolean): boolean {
    const server = this.servers.get(serverId);
    if (server) {
      server.isActive = isActive;
      console.log(`${isActive ? '✅' : '❌'} Server ${serverId} ${isActive ? 'activated' : 'deactivated'}`);
      return true;
    }
    return false;
  }

  /**
   * 서버 우선순위 변경
   */
  setServerPriority(serverId: string, priority: number): boolean {
    const server = this.servers.get(serverId);
    if (server) {
      server.priority = priority;
      console.log(`🔄 Server ${serverId} priority set to ${priority}`);
      return true;
    }
    return false;
  }

  /**
   * 정리 작업
   */
  destroy(): void {
    this.stopHealthCheck();
    this.servers.clear();
    this.serverStatus.clear();
  }

  /**
   * 통계 정보 조회
   */
  getStats(): {
    totalServers: number;
    activeServers: number;
    healthyServers: number;
    avgResponseTime: number;
  } {
    const total = this.servers.size;
    const active = this.getActiveServers().length;
    const healthy = this.getHealthyServers().length;
    
    const responseTimes = Array.from(this.serverStatus.values())
      .filter(status => status.isHealthy && status.responseTime > 0)
      .map(status => status.responseTime);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      totalServers: total,
      activeServers: active,
      healthyServers: healthy,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }
}

/**
 * 전역 모델 매니저 인스턴스
 */
let globalModelManager: ModelManager | null = null;

/**
 * 전역 모델 매니저 가져오기
 */
export function getModelManager(): ModelManager {
  if (!globalModelManager) {
    globalModelManager = new ModelManager();
  }
  return globalModelManager;
}

/**
 * 전역 모델 매니저 설정
 */
export function setModelManager(manager: ModelManager): void {
  globalModelManager = manager;
}

/**
 * 모델 매니저 초기화
 */
export async function initializeModelManager(options?: {
  configDir?: string;
  autoHealthCheck?: boolean;
  healthCheckInterval?: number;
}): Promise<ModelManager> {
  const manager = new ModelManager(options);
  await manager.loadConfig();
  await manager.checkAllServersHealth();
  setModelManager(manager);
  console.log('🚀 Model manager initialized');
  return manager;
}