#!/usr/bin/env node

/**
 * 테스트용 프록시 서버
 * requirement.md 명세에 맞게 OpenRouter 등 외부 LLM 서비스로 요청 전달
 */

import http from 'http';
import https from 'https';
import { config } from 'dotenv';

// .env 파일 로드
config();

const PORT = process.env.PORT || 8443;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const USE_MOCK_RESPONSE = !OPENROUTER_API_KEY; // API 키가 없으면 모의 응답 사용

console.log(`[프록시] 포트 ${PORT}에서 HTTP 서버를 시작합니다...`);
console.log(`[프록시] OpenRouter API 키: ${OPENROUTER_API_KEY ? '✅ 설정됨' : '❌ 미설정 (모의 응답 모드)'}`);

// OpenRouter로 요청 전달하는 함수
async function forwardToOpenRouter(requestData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: requestData.model || 'openai/gpt-3.5-turbo',
      messages: requestData.messages,
      max_tokens: requestData.max_tokens || 2000,
      temperature: requestData.temperature || 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://qwen-code.internal',
        'X-Title': 'Qwen Code Internal LLM Proxy',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`OpenRouter 응답 파싱 실패: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`OpenRouter 요청 실패: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  console.log(`[PROXY] ${req.method} ${req.url}`);
  
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 내부망 LLM API 엔드포인트 시뮬레이션
  if (req.url === '/devport/api/v1/chat/completions' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        console.log('[PROXY] Request data:', requestData);
        
        let response;
        
        if (USE_MOCK_RESPONSE) {
          // OpenRouter API 키가 없으면 모의 응답
          response = {
            id: 'chatcmpl-' + Math.random().toString(36).substr(2, 9),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: requestData.model || 'internal-llm-model',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: '안녕하세요! 내부망 LLM 모델에서 응답드립니다. 현재 테스트 모드로 동작 중입니다. OpenRouter API 키를 설정하면 실제 LLM 서비스로 연결됩니다.'
              },
              finish_reason: 'stop'
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30
            }
          };
          console.log('[PROXY] 모의 응답 반환');
        } else {
          // OpenRouter로 실제 요청 전달
          console.log('[PROXY] OpenRouter로 요청 전달 중...');
          try {
            response = await forwardToOpenRouter(requestData);
            console.log('[PROXY] OpenRouter 응답 수신 완료');
          } catch (error) {
            console.error('[PROXY] OpenRouter 요청 실패:', error.message);
            // 실패 시 에러 응답
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'External LLM service error',
              details: error.message 
            }));
            return;
          }
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
      } catch (error) {
        console.error('[PROXY] Error parsing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request' }));
      }
    });
    
  } else {
    // 다른 요청은 404 반환
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

// SSL 에러 무시 (테스트용)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

server.listen(PORT, () => {
  console.log(`[PROXY] 테스트용 프록시 서버가 http://localhost:${PORT}에서 실행 중입니다`);
  console.log(`[PROXY] API 엔드포인트: http://localhost:${PORT}/devport/api/v1/chat/completions`);
  console.log(`[PROXY] 테스트용 HTTP 서버입니다`);
});

server.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error(`[PROXY] 포트 ${PORT}에 대한 접근 권한이 없습니다. 관리자 권한으로 실행해주세요.`);
    console.log(`[PROXY] 또는 다른 포트를 사용하려면 PORT 환경변수를 설정하세요: PORT=8443 node test-proxy-server.js`);
  } else {
    console.error(`[PROXY] 서버 에러:`, err);
  }
  process.exit(1);
});