# 테스트용 프록시 서버 사용법

이 프록시 서버는 내부망 LLM API를 시뮬레이션하여 OpenRouter API로 요청을 포워딩합니다.

## 🚀 시작하기

### 1. 프록시 서버 실행
```bash
node test-proxy-server.js
```

또는 다른 포트로 실행:
```bash
PORT=8080 node test-proxy-server.js
```

### 2. Qwen Code 실행
```bash
npm run start
```

## 📋 설정 정보

### 프록시 서버 설정
- **포트**: 9443 (기본값)
- **엔드포인트**: `/devport/api/v1/chat/completions`
- **대상 API**: OpenRouter AI (https://openrouter.ai/api/v1/chat/completions)
- **모델**: qwen/qwen3-235b-a22b-07-25:free

### .env 파일 설정
```env
INTERNAL_LLM_BASE_URL=http://localhost:9443/devport/api/v1
INTERNAL_LLM_API_KEY=test-key
INTERNAL_LLM_MODEL=internal-llm-model
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 🧪 테스트

### API 테스트
```bash
node test-proxy-client.js
```

### curl 테스트
```bash
curl -X POST http://localhost:9443/devport/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-key" \
  -d '{
    "model": "internal-llm-model",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 100
  }'
```

## 🔧 작동 원리

1. **요청 수신**: 클라이언트에서 `/devport/api/v1/chat/completions`로 요청
2. **변환**: OpenAI 형식 요청을 OpenRouter 형식으로 변환
   - 모델명을 `qwen/qwen3-235b-a22b-07-25:free`로 교체
   - 필요한 헤더 추가 (Authorization, HTTP-Referer 등)
3. **포워딩**: OpenRouter API로 HTTPS 요청 전송
4. **응답 반환**: OpenRouter 응답을 그대로 클라이언트에 전달

## 📊 로그 예시

```
🚀 테스트용 프록시 서버가 http://localhost:9443에서 실행 중입니다
📡 대상 API: https://openrouter.ai/api/v1/chat/completions
🤖 모델: qwen/qwen3-235b-a22b-07-25:free
🔗 프록시 엔드포인트: http://localhost:9443/devport/api/v1/chat/completions

[PROXY] POST /devport/api/v1/chat/completions
[PROXY] 원본 요청: {
  "model": "internal-llm-model",
  "messages": [{"role": "user", "content": "Hello!"}]
}
[PROXY] OpenRouter 요청: {
  "model": "qwen/qwen3-235b-a22b-07-25:free",
  "messages": [{"role": "user", "content": "Hello!"}]
}
[PROXY] OpenRouter 응답 상태: 200
```

## 🚨 주의사항

- **테스트 전용**: 프로덕션 환경에서 사용하지 마세요
- **HTTP 서버**: HTTPS가 아닌 HTTP로 동작합니다
- **API 키**: OpenRouter API 키가 하드코딩되어 있습니다
- **SSL 우회**: NODE_TLS_REJECT_UNAUTHORIZED=0 설정으로 SSL 검증을 우회합니다

## 🔧 문제 해결

### 포트 사용 중 오류
```
Error: listen EADDRINUSE: address already in use :::9443
```
다른 포트로 실행하세요:
```bash
PORT=8080 node test-proxy-server.js
```

### 연결 오류
1. 프록시 서버가 실행 중인지 확인
2. .env 파일의 포트가 올바른지 확인
3. 방화벽 설정 확인

### OpenRouter API 오류
- API 키가 유효한지 확인
- 모델명이 올바른지 확인
- 네트워크 연결 상태 확인