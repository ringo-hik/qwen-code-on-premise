/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import https from 'node:https';
import http from 'node:http';
import { GenerateContentResponse, FinishReason } from '@google/genai';
import { analyzeAndCreateInternalLlmError } from './internalLlmErrorHandler.js';

export interface StreamingConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout?: number;
  chunkSize?: number;
  retryCount?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  metadata?: {
    tokenCount?: number;
    finishReason?: FinishReason;
  };
}

export class StreamingManager {
  private config: StreamingConfig;
  private httpsAgent: https.Agent;
  private activeStreams: Set<AbortController> = new Set();

  constructor(config: StreamingConfig) {
    this.config = {
      timeout: 30000,
      chunkSize: 1024,
      retryCount: 3,
      ...config,
    };
    
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: this.config.timeout,
    });
  }

  async* generateStream(request: any): AsyncGenerator<GenerateContentResponse> {
    const controller = new AbortController();
    this.activeStreams.add(controller);

    try {
      const requestBody = {
        ...request,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      };

      const url = `${this.config.baseUrl}/chat/completions`;
      const isHttps = url.startsWith('https://');
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        ...(isHttps && { agent: this.httpsAgent }),
      };

      const stream = await this.createStreamRequest(url, options, requestBody);
      let buffer = '';
      let totalContent = '';
      let tokenCount = 0;

      for await (const chunk of stream) {
        if (controller.signal.aborted) {
          break;
        }

        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue;
          }

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield this.createFinalResponse(totalContent, tokenCount);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              totalContent += delta.content;
              tokenCount += this.estimateTokens(delta.content);
              
              yield this.createStreamResponse(delta.content, false, {
                tokenCount,
                finishReason: parsed.choices?.[0]?.finish_reason,
              });
            }
          } catch (error) {
            console.warn('[STREAMING] Failed to parse chunk:', data);
          }
        }
      }

      // 스트림이 정상적으로 종료되지 않은 경우 최종 응답 생성
      if (totalContent) {
        yield this.createFinalResponse(totalContent, tokenCount);
      }

    } catch (error) {
      const streamError = analyzeAndCreateInternalLlmError(
        error instanceof Error ? error : new Error(String(error)),
        { url: this.config.baseUrl }
      );
      throw streamError;
    } finally {
      this.activeStreams.delete(controller);
    }
  }

  private async createStreamRequest(
    url: string, 
    options: any, 
    body: any
  ): Promise<AsyncIterable<string>> {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    const requestData = JSON.stringify(body);

    return new Promise<AsyncIterable<string>>((resolve, reject) => {
      const req = client.request(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Length': Buffer.byteLength(requestData),
        },
      }, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        // 스트리밍 데이터를 비동기 이터레이터로 변환
        const asyncIterable = {
          [Symbol.asyncIterator]: async function* () {
            res.setEncoding('utf8');
            
            for await (const chunk of res) {
              yield chunk;
            }
          }
        };

        resolve(asyncIterable);
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.setTimeout(this.config.timeout || 30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(requestData);
      req.end();
    });
  }

  private createStreamResponse(
    content: string, 
    done: boolean, 
    metadata?: StreamChunk['metadata']
  ): GenerateContentResponse {
    return {
      candidates: [{
        content: {
          parts: [{ text: content }],
          role: 'model',
        },
        finishReason: done ? FinishReason.STOP : FinishReason.OTHER,
        index: 0,
      }],
      usageMetadata: {
        promptTokenCount: 0,
        candidatesTokenCount: metadata?.tokenCount || this.estimateTokens(content),
        totalTokenCount: metadata?.tokenCount || this.estimateTokens(content),
      },
      text: content,
      data: undefined,
      functionCalls: [],
      executableCode: undefined,
      codeExecutionResult: undefined,
    } as GenerateContentResponse;
  }

  private createFinalResponse(totalContent: string, tokenCount: number): GenerateContentResponse {
    return {
      candidates: [{
        content: {
          parts: [{ text: totalContent }],
          role: 'model',
        },
        finishReason: FinishReason.STOP,
        index: 0,
      }],
      usageMetadata: {
        promptTokenCount: 0,
        candidatesTokenCount: tokenCount,
        totalTokenCount: tokenCount,
      },
      text: totalContent,
      data: undefined,
      functionCalls: [],
      executableCode: undefined,
      codeExecutionResult: undefined,
    } as GenerateContentResponse;
  }

  private estimateTokens(text: string): number {
    // 간단한 토큰 추정 (실제로는 더 정교한 알고리즘 필요)
    return Math.ceil(text.length / 4);
  }

  // 연결 상태 모니터링
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/health`;
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      return new Promise((resolve) => {
        const req = client.request(url, {
          method: 'GET',
          timeout: 5000,
          ...(isHttps && { agent: this.httpsAgent }),
        }, (res) => {
          resolve(res.statusCode === 200);
        });

        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
        
        req.end();
      });
    } catch {
      return false;
    }
  }

  // 활성 스트림 정리
  cleanup(): void {
    for (const controller of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
    
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
    }
  }

  // 성능 메트릭
  getMetrics(): {
    activeStreams: number;
    connectionPool: {
      maxSockets: number;
      currentSockets: number;
    };
  } {
    return {
      activeStreams: this.activeStreams.size,
      connectionPool: {
        maxSockets: 10,
        currentSockets: this.httpsAgent.freeSockets ? 
          Object.values(this.httpsAgent.freeSockets).flat().length : 0,
      },
    };
  }
}