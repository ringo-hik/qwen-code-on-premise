# 내부망 LLM 사용 가이드

Qwen Code의 내부망 LLM 기능을 사용하는 방법에 대한 상세한 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [빠른 시작](#빠른-시작)
3. [설정 방법](#설정-방법)
4. [문제 해결](#문제-해결)
5. [고급 설정](#고급-설정)
6. [개발자 가이드](#개발자-가이드)

## 개요

### 내부망 LLM이란?

내부망 LLM은 외부 인터넷 접속 없이 조직 내부의 LLM 서버를 사용할 수 있는 기능입니다.

**주요 특징:**
- ✅ 완전한 오프라인 작업 환경
- ✅ 데이터 보안 및 프라이버시 보장
- ✅ 조직 맞춤형 모델 사용 가능
- ✅ OpenAI API 호환 인터페이스
- ✅ 기존 워크플로우와 완벽 호환

**지원되는 환경:**
- Windows, macOS, Linux
- Docker 컨테이너
- 클라우드 및 온프레미스
- CI/CD 파이프라인

## 빠른 시작

### 1단계: 프로젝트 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd qwen-code

# 의존성 설치
npm install
```

### 2단계: 내부망 모드 활성화

```bash
# 글로벌 설정 스크립트 실행
npm run setup-internal
```

### 3단계: 테스트 실행

```bash
# 테스트 서버 시작 (별도 터미널)
npm run test:proxy

# Qwen Code 실행
npm run qwen
```

### 4단계: 연결 확인

Qwen Code 내에서 다음 명령어로 연결 상태를 확인합니다:

```
/validate
```

## 설정 방법

### 환경변수 설정

내부망 LLM을 사용하기 위해 다음 환경변수를 설정해야 합니다:

#### 필수 환경변수

```bash
# 인증 방식 설정
QWEN_AUTH_TYPE=internal-llm

# LLM 서버 API 엔드포인트
INTERNAL_LLM_BASE_URL=http://your-llm-server:8443/api/v1

# API 인증 키
INTERNAL_LLM_API_KEY=your-api-key

# 사용할 모델명
INTERNAL_LLM_MODEL=your-model-name
```

#### 선택적 환경변수

```bash
# SSL 인증서 검증 우회 (자체 서명 인증서 사용시)
NODE_TLS_REJECT_UNAUTHORIZED=0

# 디버그 모드 활성화
DEBUG=1

# 요청 타임아웃 설정 (밀리초)
INTERNAL_LLM_TIMEOUT=30000
```

### 설정 파일 방식

#### 로컬 설정 (프로젝트별)

프로젝트 루트에 `.env` 파일 생성:

```env
# .env 파일
INTERNAL_LLM_BASE_URL=http://your-internal-server:8443/api/v1
INTERNAL_LLM_API_KEY=your-api-key
INTERNAL_LLM_MODEL=your-model-name
NODE_TLS_REJECT_UNAUTHORIZED=0
```

#### 글로벌 설정 (사용자별)

`~/.qwen/.env` 파일 생성:

```env
# ~/.qwen/.env 파일
INTERNAL_LLM_BASE_URL=http://your-internal-server:8443/api/v1
INTERNAL_LLM_API_KEY=your-api-key
INTERNAL_LLM_MODEL=your-model-name
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 설정 우선순위

1. 명령행 인수
2. 로컬 `.env` 파일
3. 글로벌 `~/.qwen/.env` 파일
4. 시스템 환경변수
5. 기본값

## 문제 해결

### 진단 도구

Qwen Code는 내부망 LLM 연결 문제를 진단할 수 있는 도구를 제공합니다:

#### 빠른 진단

```
/diagnose
```

이 명령어는 다음을 확인합니다:
- 환경변수 설정 상태
- 네트워크 연결 가능성
- 기본적인 설정 오류

#### 상세 검증

```
/validate
```

이 명령어는 다음을 수행합니다:
- 완전한 설정 검증
- 실제 서버 연결 테스트
- 응답 시간 측정
- 상세한 오류 분석

### 일반적인 문제들

#### 1. 연결 거부 오류

**증상:**
```
Error: connect ECONNREFUSED 127.0.0.1:8443
```

**해결방법:**
1. 서버가 실행 중인지 확인
2. 포트 번호가 올바른지 확인
3. 방화벽 설정 확인

```bash
# 서버 상태 확인
curl http://localhost:8443/api/v1/chat/completions

# 테스트 서버 실행
npm run test:proxy
```

#### 2. 인증 실패

**증상:**
```
Error: 401 Unauthorized
```

**해결방법:**
1. API 키 확인
2. 인증 방식 확인

```bash
# API 키 확인
echo $INTERNAL_LLM_API_KEY

# 올바른 키로 재설정
export INTERNAL_LLM_API_KEY=correct-api-key
```

#### 3. 타임아웃 오류

**증상:**
```
Error: Request timeout
```

**해결방법:**
1. 네트워크 속도 확인
2. 타임아웃 값 증가

```bash
# 타임아웃 30초로 설정
export INTERNAL_LLM_TIMEOUT=30000
```

#### 4. SSL 인증서 오류

**증상:**
```
Error: DEPTH_ZERO_SELF_SIGNED_CERT
```

**해결방법:**
```bash
# SSL 검증 우회 (개발 환경에서만)
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 디버깅 방법

#### 디버그 모드 활성화

```bash
DEBUG=1 qwen
```

#### 상세 로그 확인

```bash
# 네트워크 요청 로그
DEBUG=http qwen

# 모든 디버그 로그
DEBUG=* qwen
```

#### 로그 파일 위치

- 애플리케이션 로그: `~/.qwen/logs/`
- 요청/응답 로그: `~/.qwen/network.log`
- 에러 로그: `~/.qwen/error.log`

## 고급 설정

### 프록시 서버 설정

회사 프록시를 통해 연결해야 하는 경우:

```bash
# HTTP 프록시
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# 프록시 제외 설정
export NO_PROXY=localhost,127.0.0.1,internal-server
```

### 로드 밸런싱

여러 LLM 서버를 사용하는 경우:

```env
# 주 서버
INTERNAL_LLM_BASE_URL=http://llm-server-1:8443/api/v1

# 백업 서버 (향후 지원 예정)
INTERNAL_LLM_BACKUP_URLS=http://llm-server-2:8443/api/v1,http://llm-server-3:8443/api/v1
```

### 성능 최적화

```env
# 연결 풀 설정
INTERNAL_LLM_POOL_SIZE=10

# 캐시 설정
INTERNAL_LLM_CACHE_ENABLED=true
INTERNAL_LLM_CACHE_TTL=3600

# 압축 설정
INTERNAL_LLM_COMPRESSION=gzip
```

### 보안 설정

```env
# 요청 재시도 설정
INTERNAL_LLM_RETRY_COUNT=3
INTERNAL_LLM_RETRY_DELAY=1000

# 요청 크기 제한
INTERNAL_LLM_MAX_REQUEST_SIZE=10MB
INTERNAL_LLM_MAX_RESPONSE_SIZE=50MB

# API 키 암호화 (향후 지원 예정)
INTERNAL_LLM_ENCRYPT_API_KEY=true
```

## 개발자 가이드

### API 호환성

내부망 LLM 서버는 OpenAI Chat Completions API와 호환되어야 합니다.

#### 필수 엔드포인트

```
POST /chat/completions
```

#### 요청 형식

```json
{
  "model": "your-model",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

#### 응답 형식

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "your-model",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

### 커스텀 구현

#### 내부망 LLM 클라이언트 확장

```typescript
import { InternalLlmContentGenerator } from '@qwen-code/qwen-code-core';

class CustomInternalLlmGenerator extends InternalLlmContentGenerator {
  // 커스텀 인증 로직
  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Custom-Header': 'custom-value',
    };
  }

  // 커스텀 요청 변환
  protected transformRequest(request: any): any {
    // 요청 형식을 서버에 맞게 변환
    return {
      ...request,
      customField: 'customValue',
    };
  }
}
```

#### 에러 처리 커스터마이징

```typescript
import { analyzeAndCreateInternalLlmError } from '@qwen-code/qwen-code-core';

try {
  const response = await llmClient.generateContent(request);
} catch (error) {
  const internalError = analyzeAndCreateInternalLlmError(
    error as Error,
    { 
      url: 'http://your-server:8443',
      statusCode: 500 
    }
  );
  
  console.error(internalError.getDetailedDiagnostic());
  
  // 커스텀 에러 처리 로직
  handleCustomError(internalError);
}
```

### 테스트 및 모킹

#### 단위 테스트

```typescript
import { InternalLlmValidator } from '@qwen-code/qwen-code-core';

describe('InternalLlmValidator', () => {
  it('should validate configuration', async () => {
    const config = {
      baseUrl: 'http://localhost:8443/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    };
    
    const validator = new InternalLlmValidator(config);
    const result = await validator.validateConfiguration();
    
    expect(result.isValid).toBe(true);
  });
});
```

#### 통합 테스트

```typescript
import { InternalLlmContentGenerator } from '@qwen-code/qwen-code-core';

describe('InternalLlm Integration', () => {
  it('should generate content', async () => {
    const generator = new InternalLlmContentGenerator({
      baseUrl: process.env.TEST_LLM_URL,
      apiKey: process.env.TEST_API_KEY,
      model: process.env.TEST_MODEL,
    });
    
    const response = await generator.generateContent({
      contents: [{ parts: [{ text: 'Hello' }], role: 'user' }],
    });
    
    expect(response.candidates).toHaveLength(1);
    expect(response.candidates[0].content.parts[0].text).toBeDefined();
  });
});
```

### CI/CD 통합

#### GitHub Actions 예시

```yaml
name: Internal LLM Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      llm-server:
        image: your-llm-server:latest
        ports:
          - 8443:8443
        env:
          MODEL_NAME: test-model
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Wait for LLM server
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8443/health; do sleep 1; done'
        
      - name: Run tests
        env:
          INTERNAL_LLM_BASE_URL: http://localhost:8443/api/v1
          INTERNAL_LLM_API_KEY: test-key
          INTERNAL_LLM_MODEL: test-model
        run: npm test
```

### 성능 모니터링

#### 메트릭 수집

```typescript
import { InternalLlmContentGenerator } from '@qwen-code/qwen-code-core';

class MonitoredInternalLlmGenerator extends InternalLlmContentGenerator {
  private metrics = {
    requests: 0,
    successes: 0,
    failures: 0,
    totalResponseTime: 0,
  };

  async generateContent(request: any) {
    const startTime = Date.now();
    this.metrics.requests++;
    
    try {
      const result = await super.generateContent(request);
      this.metrics.successes++;
      return result;
    } catch (error) {
      this.metrics.failures++;
      throw error;
    } finally {
      this.metrics.totalResponseTime += Date.now() - startTime;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.metrics.totalResponseTime / this.metrics.requests,
      successRate: this.metrics.successes / this.metrics.requests,
    };
  }
}
```

## 추가 리소스

### 공식 문서

- [Qwen Code 메인 문서](../README.md)
- [API 참조](./api-reference.md)
- [설정 참조](./configuration.md)

### 커뮤니티

- [GitHub Issues](https://github.com/QwenLM/qwen-code/issues)
- [토론 포럼](https://github.com/QwenLM/qwen-code/discussions)

### 지원

문제가 발생하면 다음 정보와 함께 이슈를 등록해주세요:

1. 운영체제 및 버전
2. Node.js 버전
3. Qwen Code 버전
4. 에러 메시지 전문
5. `/diagnose` 명령어 결과
6. 환경변수 설정 (민감한 정보 제외)

---

*이 문서는 Qwen Code v0.0.1-alpha.8 기준으로 작성되었습니다.*