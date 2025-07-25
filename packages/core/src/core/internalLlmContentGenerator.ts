/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import https from 'node:https';
import http from 'node:http';
import {
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensResponse,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  FinishReason,
} from '@google/genai';
import { ContentGenerator, ContentGeneratorConfig } from './contentGenerator.js';
import { 
  analyzeAndCreateInternalLlmError,
  performQuickDiagnosis,
  InternalLlmError,
} from '../utils/internalLlmErrorHandler.js';
import { StreamingManager } from '../utils/streamingManager.js';

// SSL 우회 설정
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class InternalLlmContentGenerator implements ContentGenerator {
  private config: ContentGeneratorConfig;
  private httpsAgent: https.Agent;
  private streamingManager: StreamingManager;

  constructor(config: ContentGeneratorConfig) {
    this.config = config;
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });
    
    // 스트리밍 매니저 초기화
    this.streamingManager = new StreamingManager({
      baseUrl: config.baseUrl || 'http://localhost:8443/devport/api/v1',
      apiKey: config.apiKey || '',
      model: config.model || 'default',
    });
  }

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    const messages = this.convertToOpenAIFormat(request);
    
    const requestBody = {
      model: this.config.model,
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
    };

    try {
      const response = await this.makeApiRequest('/chat/completions', requestBody);
      return this.convertFromOpenAIFormat(response);
    } catch (error) {
      const internalLlmError = analyzeAndCreateInternalLlmError(
        error instanceof Error ? error : new Error(String(error)),
        { url: this.config.baseUrl }
      );
      
      console.error('[INTERNAL_LLM] API 요청 실패:');
      console.error(internalLlmError.getDetailedDiagnostic());
      
      throw internalLlmError;
    }
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    try {
      // OpenAI 형식으로 변환
      const messages = this.convertToOpenAIFormat(request);
      const requestBody = {
        model: this.config.model,
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      };

      // 스트리밍 매니저를 사용하여 실시간 응답 처리
      return this.streamingManager.generateStream(requestBody);
      
    } catch (error) {
      const internalLlmError = analyzeAndCreateInternalLlmError(
        error instanceof Error ? error : new Error(String(error)),
        { url: this.config.baseUrl }
      );
      
      console.error('[INTERNAL_LLM] 스트리밍 실패:');
      console.error(internalLlmError.getDetailedDiagnostic());
      
      // 에러 발생 시 폴백으로 일반 응답 사용
      const fallbackResponse = await this.generateContent(request);
      return (async function* () {
        yield fallbackResponse;
      })();
    }
  }

  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    // 토큰 카운트는 대략적으로 계산
    const text = JSON.stringify(request);
    const approximateTokens = Math.ceil(text.length / 4);
    
    return {
      totalTokens: approximateTokens,
    };
  }

  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    throw new Error('Embedding not supported for internal LLM');
  }

  private convertToOpenAIFormat(request: GenerateContentParameters): any[] {
    const messages = [];
    
    if (request.contents && Array.isArray(request.contents)) {
      for (const content of request.contents) {
        // content가 객체이고 parts와 role을 가지고 있는지 확인
        if (typeof content === 'object' && content !== null && 'parts' in content && 'role' in content) {
          const contentObj = content as { parts: any[], role: string };
          if (Array.isArray(contentObj.parts)) {
            for (const part of contentObj.parts) {
              if (part && typeof part === 'object' && 'text' in part && part.text) {
                messages.push({
                  role: contentObj.role === 'model' ? 'assistant' : 'user',
                  content: part.text,
                });
              }
            }
          }
        }
      }
    }
    
    return messages;
  }

  private convertFromOpenAIFormat(openAIResponse: any): GenerateContentResponse {
    const choice = openAIResponse.choices?.[0];
    const content = choice?.message?.content || '응답을 생성하지 못했습니다.';
    
    return {
      candidates: [{
        content: {
          parts: [{ text: content }],
          role: 'model',
        },
        finishReason: FinishReason.STOP,
        index: 0,
      }],
      usageMetadata: {
        promptTokenCount: openAIResponse.usage?.prompt_tokens || 0,
        candidatesTokenCount: openAIResponse.usage?.completion_tokens || 0,
        totalTokenCount: openAIResponse.usage?.total_tokens || 0,
      },
      // 필수 속성들 추가
      text: content,
      data: undefined,
      functionCalls: [],
      executableCode: undefined,
      codeExecutionResult: undefined,
    } as GenerateContentResponse;
  }

  private async makeApiRequest(endpoint: string, body: any): Promise<any> {
    const baseUrl = this.config.baseUrl || 'http://localhost:8443/devport/api/v1';
    const url = `${baseUrl}${endpoint}`;
    const isHttps = url.startsWith('https://');
    
    return new Promise((resolve, reject) => {
      const requestData = JSON.stringify(body);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Length': Buffer.byteLength(requestData),
        },
        ...(isHttps && { agent: this.httpsAgent }),
      };

      const client = isHttps ? https : http;
      const req = client.request(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              const error = new Error(`API 요청 실패: ${res.statusCode} ${data}`);
              const internalLlmError = analyzeAndCreateInternalLlmError(error, {
                url,
                statusCode: res.statusCode,
              });
              reject(internalLlmError);
            }
          } catch (error) {
            const parseError = new Error(`JSON 파싱 실패: ${data}`);
            const internalLlmError = analyzeAndCreateInternalLlmError(parseError, {
              url,
              statusCode: res.statusCode,
            });
            reject(internalLlmError);
          }
        });
      });

      req.on('error', (error) => {
        const networkError = new Error(`네트워크 오류: ${error.message}`);
        const internalLlmError = analyzeAndCreateInternalLlmError(networkError, { url });
        reject(internalLlmError);
      });

      req.write(requestData);
      req.end();
    });
  }

  // 스트리밍 연결 상태 확인
  async isStreamingHealthy(): Promise<boolean> {
    return this.streamingManager.healthCheck();
  }

  // 성능 메트릭 조회
  getStreamingMetrics() {
    return this.streamingManager.getMetrics();
  }

  // 리소스 정리
  cleanup(): void {
    this.streamingManager.cleanup();
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
    }
  }
}