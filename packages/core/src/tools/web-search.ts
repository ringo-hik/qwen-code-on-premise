/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroundingMetadata } from '@google/genai';
import { BaseTool, ToolResult } from './tools.js';
import { Type } from '@google/genai';
import { SchemaValidator } from '../utils/schemaValidator.js';
import { getErrorMessage } from '../utils/errors.js';
import { Config } from '../config/config.js';
import { fetchWithTimeout } from '../utils/fetch.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

interface GroundingChunkItem {
  web?: GroundingChunkWeb;
}

interface GroundingSupportSegment {
  startIndex: number;
  endIndex: number;
  text?: string;
}

interface GroundingSupportItem {
  segment?: GroundingSupportSegment;
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

/**
 * 내부 웹 URL 설정 인터페이스
 */
interface InternalUrlConfig {
  url: string;
  description: string;
  categories: string[];
  keywords: string[];
  priority: number;
}

interface InternalWebConfig {
  enabled: boolean;
  timeout: number;
  max_retries?: number;
  concurrent_requests?: number;
  cache_enabled?: boolean;
  cache_ttl?: number;
  user_agent?: string;
  urls: Record<string, InternalUrlConfig>;
  search_config?: {
    min_score_threshold?: number;
    max_results?: number;
    enable_fuzzy_match?: boolean;
    keyword_weight?: number;
    description_weight?: number;
    category_weight?: number;
    priority_weight?: number;
  };
  crawl_config?: {
    max_page_size?: number;
    follow_redirects?: boolean;
    extract_links?: boolean;
    parse_html?: boolean;
    remove_scripts?: boolean;
    remove_styles?: boolean;
    text_only?: boolean;
  };
}

/**
 * Parameters for the WebSearchTool.
 */
export interface WebSearchToolParams {
  /**
   * The search query.
   */
  query: string;
}

/**
 * Extends ToolResult to include sources for web search.
 */
export interface WebSearchToolResult extends ToolResult {
  sources?: GroundingMetadata extends { groundingChunks: GroundingChunkItem[] }
    ? GroundingMetadata['groundingChunks']
    : GroundingChunkItem[];
}

/**
 * 온프레미스 환경을 위한 내부 웹 검색 도구
 * Google API 대신 사전 정의된 내부 URL에서 검색을 수행합니다.
 */
export class WebSearchTool extends BaseTool<
  WebSearchToolParams,
  WebSearchToolResult
> {
  static readonly Name: string = 'internal_web_search';
  private internalConfig: InternalWebConfig | null = null;
  private configCache = new Map<string, { content: string; timestamp: number }>();

  constructor(private readonly config: Config) {
    super(
      WebSearchTool.Name,
      'InternalWebSearch',
      '내부 웹사이트에서 정보를 검색합니다. 사전 정의된 내부 URL 목록에서 검색 쿼리에 가장 적합한 웹사이트를 찾아 정보를 추출합니다.',
      {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: '내부 웹사이트에서 검색할 쿼리입니다.',
          },
        },
        required: ['query'],
      },
    );
  }

  /**
   * 내부 웹 설정 파일을 로드합니다.
   */
  private async loadInternalConfig(): Promise<InternalWebConfig | null> {
    if (this.internalConfig) {
      return this.internalConfig;
    }

    const configPath = process.env.INTERNAL_WEB_CONFIG_PATH || 
                      path.join(process.cwd(), 'internal-web-config.json');

    try {
      if (!fs.existsSync(configPath)) {
        console.warn(`내부 웹 설정 파일을 찾을 수 없습니다: ${configPath}`);
        return null;
      }

      const configData = fs.readFileSync(configPath, 'utf-8');
      this.internalConfig = JSON.parse(configData);
      
      if (!this.internalConfig?.enabled) {
        console.log('내부 웹 검색이 비활성화되어 있습니다.');
        return null;
      }

      return this.internalConfig;
    } catch (error) {
      console.error('내부 웹 설정 파일 로드 실패:', getErrorMessage(error));
      return null;
    }
  }

  /**
   * 검색 쿼리에 가장 적합한 내부 URL을 선택합니다.
   */
  private selectBestUrls(query: string, config: InternalWebConfig): InternalUrlConfig[] {
    const urls = Object.values(config.urls);
    const searchConfig = config.search_config || {};
    const maxResults = searchConfig.max_results || 3;
    const minThreshold = searchConfig.min_score_threshold || 0.3;
    
    // 가중치 설정
    const keywordWeight = searchConfig.keyword_weight || 0.4;
    const descriptionWeight = searchConfig.description_weight || 0.4;
    const categoryWeight = searchConfig.category_weight || 0.2;
    const priorityWeight = searchConfig.priority_weight || 0.1;

    // 쿼리를 소문자로 변환하고 키워드 추출
    const queryLower = query.toLowerCase();
    const queryKeywords = queryLower.split(/\s+/);

    // 각 URL에 대한 점수 계산
    const scoredUrls = urls.map(urlConfig => {
      let score = 0;

      // 키워드 매칭 점수
      const keywordMatches = urlConfig.keywords.filter(keyword => 
        queryKeywords.some(q => keyword.toLowerCase().includes(q) || q.includes(keyword.toLowerCase()))
      ).length;
      const keywordScore = (keywordMatches / Math.max(urlConfig.keywords.length, 1)) * keywordWeight;

      // 설명 매칭 점수
      const descriptionMatches = queryKeywords.filter(q => 
        urlConfig.description.toLowerCase().includes(q)
      ).length;
      const descriptionScore = (descriptionMatches / queryKeywords.length) * descriptionWeight;

      // 카테고리 매칭 점수
      const categoryMatches = urlConfig.categories.filter(category =>
        queryKeywords.some(q => category.toLowerCase().includes(q) || q.includes(category.toLowerCase()))
      ).length;
      const categoryScore = (categoryMatches / Math.max(urlConfig.categories.length, 1)) * categoryWeight;

      // 우선순위 점수 (10점 만점)
      const priorityScore = (urlConfig.priority / 10) * priorityWeight;

      score = keywordScore + descriptionScore + categoryScore + priorityScore;

      return { ...urlConfig, score };
    });

    // 점수 순으로 정렬하고 임계값 이상만 반환
    return scoredUrls
      .filter(url => url.score >= minThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * 웹페이지에서 텍스트를 추출합니다.
   */
  private extractText(html: string, config: InternalWebConfig): string {
    const crawlConfig = config.crawl_config || {};
    
    if (!crawlConfig.parse_html) {
      return html;
    }

    let text = html;

    // 스크립트 제거
    if (crawlConfig.remove_scripts) {
      text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // 스타일 제거
    if (crawlConfig.remove_styles) {
      text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }

    // HTML 태그 제거하고 텍스트만 추출
    if (crawlConfig.text_only) {
      text = text.replace(/<[^>]+>/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
    }

    // 최대 크기 제한
    const maxSize = crawlConfig.max_page_size || 1048576; // 1MB
    if (text.length > maxSize) {
      text = text.substring(0, maxSize) + '... (내용이 잘림)';
    }

    return text;
  }

  /**
   * 웹페이지를 크롤링하고 내용을 추출합니다.
   */
  private async crawlUrl(url: string, config: InternalWebConfig, signal: AbortSignal): Promise<string> {
    const crawlConfig = config.crawl_config || {};
    const cacheKey = `${url}-${Date.now()}`;
    
    // 캐시 확인
    if (config.cache_enabled && this.configCache.has(url)) {
      const cached = this.configCache.get(url)!;
      const cacheAge = Date.now() - cached.timestamp;
      const cacheTtl = (config.cache_ttl || 3600) * 1000;
      
      if (cacheAge < cacheTtl) {
        return cached.content;
      }
    }

    try {
      const response = await fetchWithTimeout(url, config.timeout || 10000);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      const extractedText = this.extractText(content, config);

      // 캐시에 저장
      if (config.cache_enabled) {
        this.configCache.set(url, {
          content: extractedText,
          timestamp: Date.now()
        });
      }

      return extractedText;
    } catch (error) {
      throw new Error(`웹페이지 크롤링 실패 (${url}): ${getErrorMessage(error)}`);
    }
  }

  /**
   * Validates the parameters for the WebSearchTool.
   */
  validateParams(params: WebSearchToolParams): string | null {
    const errors = SchemaValidator.validate(this.schema.parameters, params);
    if (errors) {
      return errors;
    }

    if (!params.query || params.query.trim() === '') {
      return "검색 쿼리가 비어있습니다.";
    }
    return null;
  }

  getDescription(params: WebSearchToolParams): string {
    return `내부 웹사이트에서 검색 중: "${params.query}"`;
  }

  async execute(
    params: WebSearchToolParams,
    signal: AbortSignal,
  ): Promise<WebSearchToolResult> {
    const validationError = this.validateToolParams(params);
    if (validationError) {
      return {
        llmContent: `오류: 잘못된 매개변수가 제공되었습니다. 이유: ${validationError}`,
        returnDisplay: validationError,
      };
    }

    // 내부 웹 설정 로드
    const internalConfig = await this.loadInternalConfig();
    if (!internalConfig) {
      return {
        llmContent: `내부 웹 검색을 사용할 수 없습니다. 설정 파일을 확인하세요.`,
        returnDisplay: '내부 웹 검색 설정 오류',
      };
    }

    try {
      // 최적의 URL 선택
      const selectedUrls = this.selectBestUrls(params.query, internalConfig);
      
      if (selectedUrls.length === 0) {
        return {
          llmContent: `검색 쿼리 "${params.query}"에 해당하는 내부 웹사이트를 찾을 수 없습니다.`,
          returnDisplay: '검색 결과 없음',
        };
      }

      const results: string[] = [];
      const sources: GroundingChunkItem[] = [];

      // 선택된 URL들에서 정보 추출
      for (let i = 0; i < selectedUrls.length; i++) {
        const urlConfig = selectedUrls[i];
        
        try {
          const content = await this.crawlUrl(urlConfig.url, internalConfig, signal);
          
          // 검색 쿼리와 관련된 내용 추출 (간단한 키워드 기반)
          const queryKeywords = params.query.toLowerCase().split(/\s+/);
          const sentences = content.split(/[.!?]+/).filter(sentence => {
            const sentenceLower = sentence.toLowerCase();
            return queryKeywords.some(keyword => sentenceLower.includes(keyword));
          }).slice(0, 5); // 상위 5개 문장만

          if (sentences.length > 0) {
            results.push(`**${urlConfig.description}** (${urlConfig.url}):\n${sentences.join('. ')}`);
            
            sources.push({
              web: {
                uri: urlConfig.url,
                title: urlConfig.description
              }
            });
          }
        } catch (error) {
          console.error(`URL 크롤링 실패 (${urlConfig.url}):`, getErrorMessage(error));
          results.push(`**${urlConfig.description}** (${urlConfig.url}):\n오류: ${getErrorMessage(error)}`);
        }
      }

      if (results.length === 0) {
        return {
          llmContent: `내부 웹사이트에서 "${params.query}"에 대한 관련 정보를 찾을 수 없습니다.`,
          returnDisplay: '관련 정보 없음',
        };
      }

      const combinedResults = results.join('\n\n');
      const sourceList = sources.map((source, index) => 
        `[${index + 1}] ${source.web?.title} (${source.web?.uri})`
      ).join('\n');

      return {
        llmContent: `내부 웹 검색 결과 "${params.query}":\n\n${combinedResults}\n\n출처:\n${sourceList}`,
        returnDisplay: `"${params.query}"에 대한 검색 결과를 ${results.length}개 웹사이트에서 찾았습니다.`,
        sources,
      };
    } catch (error: unknown) {
      const errorMessage = `내부 웹 검색 중 오류 발생 "${params.query}": ${getErrorMessage(error)}`;
      console.error(errorMessage, error);
      return {
        llmContent: `오류: ${errorMessage}`,
        returnDisplay: `내부 웹 검색 실행 오류`,
      };
    }
  }
}