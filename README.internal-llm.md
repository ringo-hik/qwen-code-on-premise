# 내부망 LLM 설정 가이드

이 문서는 Qwen Code를 내부망 LLM 모델과 함께 사용하는 방법을 설명합니다.

## 빠른 시작

### 1. 테스트용 프록시 서버 실행
```bash
# 테스트용 내부망 LLM 서버 시작
npm run test:proxy
```

### 2. 내부망 설정으로 Qwen Code 실행
```bash
# 내부망 LLM으로 실행
npm run start:internal
```

## 상세 설정

### 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 내부망 LLM 인증 타입
QWEN_AUTH_TYPE=internal-llm

# API 엔드포인트 설정
INTERNAL_LLM_BASE_URL=https://your-internal-llm-server.com/api/v1
INTERNAL_LLM_API_KEY=your-api-key
INTERNAL_LLM_MODEL=your-model-name

# SSL 우회 (자체 서명 인증서 사용시)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 사용 가능한 스크립트

- `npm run test:proxy` - 테스트용 프록시 서버 실행 (localhost:443)
- `npm run start:internal` - 내부망 설정으로 Qwen Code 실행

### API 호환성

내부망 LLM 서버는 OpenAI Chat Completions API와 호환되어야 합니다:

**요청 형식:**
```json
{
  "model": "your-model-name",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**응답 형식:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "your-model-name",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 문제 해결

### SSL 인증서 오류
```bash
# SSL 검증 비활성화
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 포트 권한 오류 (443 포트 사용시)
```bash
# 관리자 권한으로 실행하거나 다른 포트 사용
PORT=8443 npm run test:proxy
```

### 프록시 환경
```bash
# HTTP 프록시 설정
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=https://proxy.company.com:8080
```

## 보안 참고사항

- `NODE_TLS_REJECT_UNAUTHORIZED=0`은 개발/테스트 환경에서만 사용하세요
- 프로덕션 환경에서는 적절한 SSL 인증서를 사용하세요
- API 키는 환경변수로 관리하고 코드에 하드코딩하지 마세요