/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '../core/contentGenerator.js';

export interface InternalLlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  connectionStatus: 'connected' | 'failed' | 'untested';
  responseTime?: number;
}

export class InternalLlmValidator {
  private readonly config: InternalLlmConfig;
  private readonly timeout: number;

  constructor(config: InternalLlmConfig, timeout: number = 10000) {
    this.config = config;
    this.timeout = timeout;
  }

  /**
   * 내부망 LLM 설정 검증
   */
  async validateConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      connectionStatus: 'untested',
    };

    // 1. 기본 설정 검증
    this.validateBasicConfig(result);

    // 2. URL 형식 검증
    this.validateUrlFormat(result);

    // 3. 네트워크 연결 테스트
    if (result.isValid) {
      await this.testConnection(result);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 기본 설정 값 검증
   */
  private validateBasicConfig(result: ValidationResult): void {
    if (!this.config.baseUrl) {
      result.errors.push('INTERNAL_LLM_BASE_URL이 설정되지 않았습니다.');
    }

    if (!this.config.apiKey) {
      result.warnings.push('INTERNAL_LLM_API_KEY가 설정되지 않았습니다. 기본값을 사용합니다.');
    }

    if (!this.config.model) {
      result.warnings.push('INTERNAL_LLM_MODEL이 설정되지 않았습니다. 기본값을 사용합니다.');
    }
  }

  /**
   * URL 형식 검증
   */
  private validateUrlFormat(result: ValidationResult): void {
    if (!this.config.baseUrl) return;

    try {
      const url = new URL(this.config.baseUrl);
      
      // HTTP/HTTPS 프로토콜 검증
      if (!['http:', 'https:'].includes(url.protocol)) {
        result.errors.push(`지원하지 않는 프로토콜입니다: ${url.protocol}. HTTP 또는 HTTPS를 사용하세요.`);
      }

      // HTTPS가 아닌 경우 경고
      if (url.protocol === 'http:') {
        result.warnings.push('HTTP 연결을 사용합니다. 보안을 위해 HTTPS 사용을 권장합니다.');
      }

      // 일반적인 API 경로 검증
      if (!url.pathname.includes('/api/v1') && !url.pathname.includes('/chat/completions')) {
        result.warnings.push('API 경로가 일반적이지 않습니다. OpenAI 호환 엔드포인트인지 확인하세요.');
      }

    } catch (error) {
      result.errors.push(`잘못된 URL 형식입니다: ${this.config.baseUrl}`);
    }
  }

  /**
   * 네트워크 연결 테스트
   */
  private async testConnection(result: ValidationResult): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Health check 엔드포인트 시도
      const healthUrl = this.buildHealthCheckUrl();
      const response = await this.makeRequest(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      result.responseTime = Date.now() - startTime;

      if (response.ok) {
        result.connectionStatus = 'connected';
      } else {
        result.connectionStatus = 'failed';
        result.warnings.push(`서버 응답: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      result.responseTime = Date.now() - startTime;
      result.connectionStatus = 'failed';
      
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          result.errors.push('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        } else if (error.message.includes('ETIMEDOUT')) {
          result.errors.push('연결 시간이 초과되었습니다. 네트워크 설정을 확인하세요.');
        } else if (error.message.includes('ENOTFOUND')) {
          result.errors.push('호스트를 찾을 수 없습니다. URL을 확인하세요.');
        } else {
          result.errors.push(`연결 오류: ${error.message}`);
        }
      } else {
        result.errors.push('알 수 없는 연결 오류가 발생했습니다.');
      }
    }
  }

  /**
   * Health check URL 구성
   */
  private buildHealthCheckUrl(): string {
    const baseUrl = this.config.baseUrl.replace(/\/+$/, ''); // 끝의 슬래시 제거
    
    // 이미 완전한 엔드포인트인 경우
    if (baseUrl.includes('/chat/completions')) {
      return baseUrl;
    }
    
    // API 베이스 URL인 경우 chat/completions 추가
    return `${baseUrl}/chat/completions`;
  }

  /**
   * HTTP 요청 실행
   */
  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 진단 정보 생성
   */
  static generateDiagnosticInfo(): string {
    const authType = process.env.QWEN_AUTH_TYPE;
    const baseUrl = process.env.INTERNAL_LLM_BASE_URL;
    const apiKey = process.env.INTERNAL_LLM_API_KEY;
    const model = process.env.INTERNAL_LLM_MODEL;
    const tlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    return `
🔍 내부망 LLM 설정 진단 정보:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 환경 변수:
  QWEN_AUTH_TYPE: ${authType || '(설정되지 않음)'}
  INTERNAL_LLM_BASE_URL: ${baseUrl || '(설정되지 않음)'}
  INTERNAL_LLM_API_KEY: ${apiKey ? '***설정됨***' : '(설정되지 않음)'}
  INTERNAL_LLM_MODEL: ${model || '(설정되지 않음)'}
  NODE_TLS_REJECT_UNAUTHORIZED: ${tlsReject || '(설정되지 않음)'}

🌐 네트워크 정보:
  플랫폼: ${process.platform}
  Node.js 버전: ${process.version}
  현재 시간: ${new Date().toISOString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
}

/**
 * 현재 환경에서 내부망 LLM 설정을 가져오기
 */
export function getCurrentInternalLlmConfig(): InternalLlmConfig {
  return {
    baseUrl: process.env.INTERNAL_LLM_BASE_URL || '',
    apiKey: process.env.INTERNAL_LLM_API_KEY || '',
    model: process.env.INTERNAL_LLM_MODEL || '',
  };
}

/**
 * 내부망 LLM 모드인지 확인
 */
export function isInternalLlmMode(): boolean {
  return process.env.QWEN_AUTH_TYPE === AuthType.USE_INTERNAL_LLM ||
         !!(process.env.INTERNAL_LLM_BASE_URL || process.env.INTERNAL_LLM_API_KEY || process.env.INTERNAL_LLM_MODEL);
}

/**
 * 빠른 설정 검증 (UI용)
 */
export async function quickValidateInternalLlm(): Promise<ValidationResult> {
  if (!isInternalLlmMode()) {
    return {
      isValid: false,
      errors: ['내부망 LLM 모드가 아닙니다.'],
      warnings: [],
      connectionStatus: 'untested',
    };
  }

  const config = getCurrentInternalLlmConfig();
  const validator = new InternalLlmValidator(config, 5000); // 5초 타임아웃
  
  return await validator.validateConfiguration();
}