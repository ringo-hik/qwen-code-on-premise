#!/usr/bin/env node

/**
 * 테스트용 프록시 서버
 * 내부망 LLM API를 시뮬레이션하여 임시 응답을 제공
 */

import http from 'http';

const PORT = process.env.PORT || 8443; // 443 대신 8443 사용

console.log(`[프록시] 포트 ${PORT}에서 HTTP 서버를 시작합니다...`);

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
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('[PROXY] Request data:', requestData);
        
        // OpenAI API 호환 응답 형식
        const response = {
          id: 'chatcmpl-' + Math.random().toString(36).substr(2, 9),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: requestData.model || 'internal-llm-model',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: '안녕하세요! 내부망 LLM 모델에서 응답드립니다. 현재 테스트 모드로 동작 중입니다.'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        };
        
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