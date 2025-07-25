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

// SSL 우회 설정
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class InternalLlmContentGenerator implements ContentGenerator {
  private config: ContentGeneratorConfig;
  private httpsAgent: https.Agent;

  constructor(config: ContentGeneratorConfig) {
    this.config = config;
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
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
      console.error('[INTERNAL_LLM] API 요청 실패:', error);
      throw error;
    }
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // 스트리밍은 일단 일반 응답으로 처리
    const response = await this.generateContent(request);
    return (async function* () {
      yield response;
    })();
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
              reject(new Error(`API 요청 실패: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`JSON 파싱 실패: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`네트워크 오류: ${error.message}`));
      });

      req.write(requestData);
      req.end();
    });
  }
}