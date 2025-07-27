# 🏢 Qwen Code - On-Premise AI Coding Assistant

![Qwen Code Screenshot](./docs/assets/qwen-screenshot.png)

**Simple, Powerful AI Development Tool for Air-Gapped Environments**

Qwen Code는 내부 네트워크에서 동작하는 AI 코딩 어시스턴트입니다. 외부 인터넷 연결 없이 내부 LLM 서버와 연동하여 코드 분석, 생성, 리팩토링을 수행할 수 있습니다.

## ✨ 핵심 기능

### 🔒 완전 오프라인 동작
- 외부 인터넷 연결 불필요
- 내부 LLM 서버와 직접 연동 (OpenAI API 호환)
- 에어갭 환경에서 안전한 코드 분석

### 🌐 내부 웹 검색
- 사전 정의된 내부 웹사이트에서 정보 검색
- 지능적 URL 선택 및 콘텐츠 추출
- 한국어 자연어 쿼리 지원

### 🛡️ 보안 최적화
- SSL 인증서 우회 (내부 서버용)
- 환경 변수 기반 설정
- 데이터 외부 유출 방지

### 🇰🇷 한국어 지원
- 자연스러운 한국어 응답
- 영문 기술 문서와 한국어 설명 병행
- 한국 개발 문화 이해

## 🚀 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd qwen-code-on-premise

# 의존성 설치
npm install

# 전역 설치
npm install -g .
```

### 2. 환경 설정

**자동 설정 (권장):**
```bash
# PowerShell에서 자동 설정 실행
.\on-premise-setup.ps1
```

**수동 설정:**
```bash
# 환경 변수 설정
export OPENAI_BASE_URL="http://your-internal-llm.company.com:8080/v1"
export OPENAI_API_KEY="your-internal-api-key"
export NODE_TLS_REJECT_UNAUTHORIZED="0"
export INTERNAL_WEB_CONFIG_PATH="./internal-web-config.json"
```

### 3. 사용 시작

```bash
# 기본 사용
qwen "React 컴포넌트를 최적화해줘"

# 내부 문서 검색
qwen "API 인증 방법을 찾아줘"

# 코드 분석
qwen "이 프로젝트의 아키텍처를 분석해줘"
```

## ⚙️ 설정

### 내부 웹 검색 설정

`internal-web-config.json` 파일을 편집하여 내부 웹사이트를 관리합니다:

```json
{
  "enabled": true,
  "timeout": 10000,
  "urls": {
    "company_wiki": {
      "url": "http://wiki.company.com",
      "description": "회사 내부 위키, 개발 가이드, API 문서",
      "categories": ["documentation", "technical"],
      "keywords": ["개발", "가이드", "문서"],
      "priority": 10
    },
    "api_docs": {
      "url": "http://api-docs.internal.com", 
      "description": "내부 API 레퍼런스, 인증 가이드",
      "categories": ["api", "reference"],
      "keywords": ["API", "인증", "엔드포인트"],
      "priority": 9
    }
  }
}
```

### 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `OPENAI_BASE_URL` | 내부 LLM 서버 URL | ✅ |
| `OPENAI_API_KEY` | API 인증 키 | ✅ |
| `OPENAI_MODEL` | 사용할 모델명 | ❌ |
| `NODE_TLS_REJECT_UNAUTHORIZED` | SSL 인증서 우회 (0 설정) | 🔧 |
| `INTERNAL_WEB_CONFIG_PATH` | 내부 웹 설정 파일 경로 | ❌ |

## 🎯 사용 예시

### 코드 분석
```bash
qwen "이 TypeScript 프로젝트의 성능 이슈를 찾아줘"
```

### 내부 문서 검색
```bash
qwen "Jenkins 파이프라인 설정 방법을 찾아줘"
```

### 코드 생성
```bash
qwen "React Hook을 사용한 데이터 페칭 컴포넌트를 만들어줘"
```

### 아키텍처 리뷰
```bash
qwen "마이크로서비스 아키텍처 관점에서 이 프로젝트를 분석해줘"
```

## 🛠️ 개발자 정보

### 빌드 및 테스트

```bash
# 프로젝트 빌드
npm run build

# 테스트 실행
npm test

# 린팅
npm run lint

# 타입 검사
npm run typecheck
```

### 프로젝트 구조

```
qwen-code-on-premise/
├── packages/
│   ├── cli/                    # CLI 인터페이스
│   └── core/                   # 핵심 로직
│       ├── src/tools/
│       │   └── web-search.ts   # 내부 웹 검색 구현
│       └── src/utils/
│           └── fetch.ts        # SSL 우회 로직
├── docs/
│   └── custom-on-premise/      # 온프레미스 문서
├── internal-web-config.json   # 내부 웹 설정
└── on-premise-setup.ps1       # 자동 설정 스크립트
```

## 🔧 문제 해결

### 일반적인 오류

**`qwen: command not found`**
```bash
# npm 글로벌 경로 확인
npm config get prefix

# 경로가 PATH에 있는지 확인
echo $PATH
```

**연결 오류 (ECONNREFUSED)**
```bash
# LLM 서버 연결 확인
curl -X POST "http://your-llm-server/v1/chat/completions" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model": "your-model", "messages": [{"role": "user", "content": "test"}]}'
```

**SSL 인증서 오류**
```bash
# SSL 우회 설정 확인
export NODE_TLS_REJECT_UNAUTHORIZED="0"
```

### 로그 확인

환경 변수 `DEBUG=1`을 설정하면 상세한 디버그 로그를 확인할 수 있습니다:

```bash
DEBUG=1 qwen "테스트 메시지"
```

## 📋 요구사항

- **Node.js**: 20.0.0 이상
- **내부 LLM 서버**: OpenAI API 호환
- **네트워크**: 내부 LLM 서버 접근 가능

## 📖 추가 문서

- [온프레미스 설치 가이드](./docs/custom-on-premise/2_user_guide_and_philosophy.md)
- [모델 통합 가이드](./docs/custom-on-premise/3_model_integration_and_evaluation.md)
- [개발 계획서](./docs/custom-on-premise/1_product_and_development_plan.md)

## 📄 라이선스

Apache 2.0 License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

**Qwen Code On-Premise** - 안전하고 강력한 내부 AI 코딩 어시스턴트 🚀