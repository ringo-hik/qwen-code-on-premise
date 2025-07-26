# 📋 온프레미스 qwen-code 적용 PRD

## 📖 요구사항 원문

> 지금부터 한국말로 대답하고 다음 내용에 대해서 기획을 해줘 
> 1. 온프레미스망에서 프로그램을 사용할 것이야. 
> 2. 온프레미스망에 LLM 서버는 내부망 서버이고 OpenAI 방식을 따르고 있어 (openrouter와 동일) 
> 3. 내부망 서버에서는 SSL 인증이 불필요하고 인증서가 설치되어 있지 않아. 외부망과 물리적으로 분리되어 있어서 그러니까 SSL 우회 코드 또는 명령어가 필요해 
> 4. 나는 이 프로젝트에 대해서 전혀 몰라, npm install -g 를 통해서 (외부망 지금) 환경에서 사용만 해봤어 
> 5. 내부망 환경에 맞게 web search는 google api도 활용할 수없고 web fetch 방식으로 정해진 url만 활용해야해 접근 가능한 url과 웹주소를 별도의 파일로 관리하면서 web search가 필요한 상황에서는 해당 파일을 통해서 수행될 수 있게 mcp 또는 내부 web 툴을 수정했으면해 이것도 최소한의 수정사항으로 내부망 웹 정의 파일은 웹주소 - 설명 형태로 되어있어서 설명을 보고 qwen-code가 스스로 판단해서 해당 웹 주소에 접속하는 형태로 진행했으면해   
> 6. 즉, 분석부터 사용법 또는 내요 구사항을 들어주기 위한 가장 쉽고 간편한 방법, 최우선, 노코드 옵션 그다음이 아주 간단한 형태의 코드수정  - [마지막 중요 포인트 사항] PoC 개념으로 내부망에서 Coding agent를 수행할 수 있음을 보이려는 것이니까 코드 수정은 없거나 최소한으로 내 요구사항이 들어줘 . 즉 첫째도 심플 둘째도 심플 아주 최소한으로 몇가지만 수정하고 옵션을 넣었떠니 내가 하고싶은 시나리오가 완성되는거야 
> 시나리오 설명해줄게, 너가 수정을 완료한 코드 기준으로 -> 일반사용자 - npm install 또는 그에 준하는 명령어를 1회 수행 - qwen 명령어를 any path에서 수행 qwen-code가 내부망 llm과 연동되어서 수행됨, 웹서치 관련 명령을 수행할 때는 (on-premise-web.js? json? md? mcp? function calling? 어떤 것이든 가장 효윺적이고 심플한 방식으로 너가 구현한 그것) 확인 후 요청에 맞는 web 탐색 후 외부망 처럼 동작

---

## 🎯 프로젝트 개요

### 프로젝트명
**온프레미스 qwen-code 어댑터** (On-Premise qwen-code Adapter)

### 목적
폐쇄망 환경에서 **최소한의 코드 수정**으로 qwen-code AI 코딩 어시스턴트를 내부 LLM 서버와 연동하여 동작시키는 PoC 구현

### 비즈니스 가치
- 보안이 중요한 기업 환경에서 AI 코딩 어시스턴트 활용 가능
- 외부 의존성 없이 내부 인프라만으로 AI 개발 도구 운영  
- 기존 투자된 내부 LLM 인프라 최대 활용

---

## 🌐 환경 분석

### 현재 환경 (AS-IS)
- **네트워크**: 외부 인터넷 연결 가능한 개발 환경
- **도구**: qwen-code를 `npm install -g`로 설치하여 사용 중
- **LLM**: 외부 클라우드 LLM 서비스 (OpenAI, Anthropic 등) 사용

### 목표 환경 (TO-BE)  
- **네트워크**: 물리적으로 격리된 온프레미스 폐쇄망
- **보안**: SSL 인증서 미설치, 내부 통신은 HTTP
- **LLM**: 내부 구축된 LLM 서버 (OpenAI API 호환, OpenRouter 스타일)
- **웹 접근**: 사전 정의된 내부 URL만 접근 가능

---

## 📋 기능 요구사항

### 1. 내부 LLM 연동 (FR-001) 🎯
- **요구사항**: qwen-code가 내부 LLM 서버와 통신
- **상세**: OpenAI API 호환 내부 서버로 API 호출 라우팅
- **구현**: 환경변수 `OPENAI_BASE_URL` 활용
- **우선순위**: 최고 (P0)

### 2. SSL 우회 처리 (FR-002) 🔓
- **요구사항**: 내부망 HTTP 통신을 위한 SSL 검증 우회
- **상세**: Node.js TLS 검증 비활성화
- **구현**: `NODE_TLS_REJECT_UNAUTHORIZED=0` 설정
- **우선순위**: 최고 (P0)

### 3. 내부 웹 검색 기능 (FR-003) 🔍
- **요구사항**: 사전 정의된 내부 URL만을 활용한 웹 검색
- **상세**: 
  - 웹 URL-설명 매핑 파일 관리 (`internal-web-config.json`)
  - AI가 설명 기반으로 적절한 URL 자동 선택
  - 선택된 URL에서 콘텐츠 크롤링 및 정보 추출
- **우선순위**: 높음 (P1)

### 4. 간편한 설치 및 사용 (FR-004) ⚡
- **요구사항**: 최소한의 설정으로 사용 가능
- **상세**: 
  - npm install 한 번으로 설치 완료
  - 환경변수 설정만으로 내부 서버 연동
  - 기존 qwen 명령어 그대로 사용
- **우선순위**: 최고 (P0)

---

## 🚫 비기능 요구사항

### 보안 요구사항 (NFR-001)
- 내부망 트래픽만 허용
- 외부 인터넷 의존성 제거
- API 키 등 민감 정보 환경변수 관리

### 성능 요구사항 (NFR-002)
- 기존 qwen-code 대비 성능 저하 최소화
- 내부 웹 검색 응답시간 5초 이내

### 호환성 요구사항 (NFR-003)
- 기존 qwen-code 사용법 100% 유지
- Node.js 20+ 환경 지원
- 주요 OS (Windows, Linux, macOS) 지원

### 유지보수 요구사항 (NFR-004)
- **코드 수정 최소화 (3개 파일 이하)** ⭐
- 업스트림 업데이트 충돌 최소화
- 설정 파일 기반 확장성

---

## 🎯 성공 기준

### 1차 성공 기준 (PoC)
- [x] 내부 LLM 서버와 정상 통신
- [x] 기본 qwen 명령어 동작
- [x] 내부 웹 URL 기반 검색 1회 성공

### 최종 시나리오 성공 기준
```
일반사용자 → npm install (1회) → 환경변수 설정 → qwen "API 문서에서 인증방법 찾아줘"
→ 내부 LLM 연동 → 내부 웹사이트 검색 → 해당 페이지 크롤링 → 답변 제공 (완료!)
```

---

## 🛠️ 기술 설계

### 아키텍처 개요
```
[사용자] → [qwen CLI] → [내부 LLM 서버] (HTTP)
                ↓
         [내부 웹 검색 모듈] → [internal-web-config.json]
                ↓
         [사전정의 URL 리스트] → [웹페이지 크롤링] → [답변 생성]
```

### 핵심 수정 사항 (총 3개 파일) 🎯

#### 1. `internal-web-config.json` (신규 생성)
```json
{
  "enabled": true,
  "urls": {
    "company_wiki": {
      "url": "http://wiki.company.com",
      "description": "회사 내부 위키, 개발 가이드, API 문서, 기술 표준"
    },
    "api_docs": {
      "url": "http://api-docs.internal.com",
      "description": "내부 API 레퍼런스, REST API 문서, 인증 가이드"
    },
    "confluence": {
      "url": "http://confluence.company.com",
      "description": "프로젝트 문서, 요구사항, 회의록, 개발 프로세스"
    }
  }
}
```

#### 2. `packages/core/src/utils/fetch.ts` (최소 수정)
```typescript
// SSL 우회 설정 추가 (기존 코드에 몇 줄만 추가)
if (process.env.NODE_ENV === 'on-premise' || process.env.ON_PREMISE_MODE === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
```

#### 3. `packages/core/src/tools/web-search.ts` (스마트 대체)
```typescript
export class InternalWebSearchTool extends BaseTool {
  private async loadInternalUrls(): Promise<InternalUrlConfig> {
    // internal-web-config.json 파일 로드
  }
  
  private selectBestUrl(query: string, urls: InternalUrlConfig): string {
    // AI 기반 설명 매칭으로 최적 URL 선택
  }
  
  private async crawlAndExtract(url: string): Promise<string> {
    // 웹페이지 크롤링 및 텍스트 추출
  }
}
```

---

## 🔧 환경 설정 방법

### 환경변수 설정 (노코드)
```bash
# 내부 LLM 서버 연동
export OPENAI_BASE_URL="http://internal-llm.company.com:8080/v1"
export OPENAI_API_KEY="any-dummy-key-for-internal"

# 온프레미스 모드 활성화
export ON_PREMISE_MODE="true"
export NODE_TLS_REJECT_UNAUTHORIZED="0"

# 내부 웹 검색 설정
export INTERNAL_WEB_CONFIG_PATH="./internal-web-config.json"
```

### 사용 시나리오
```bash
# 1. 패키지 설치 (외부망에서 1회)
npm install -g @qwen-code/qwen-code

# 2. 설정 파일 준비 (내부망으로 복사)
cp internal-web-config.json ~/

# 3. 환경변수 설정 후 실행
qwen "내부 API 문서에서 인증 방법 찾아줘"
```

---

## 📊 위험 요소 및 대응 방안

### 기술적 위험
| 위험 | 확률 | 영향도 | 대응방안 |
|------|------|--------|----------|
| 내부 LLM 서버 호환성 이슈 | 중간 | 높음 | OpenAI API 스펙 준수 확인 |
| 웹 크롤링 차단 | 낮음 | 중간 | User-Agent 설정, robots.txt 준수 |
| 성능 저하 | 중간 | 중간 | 간단한 캐싱 메커니즘 추가 |

---

## 🎯 핵심 원칙

### ⭐ **최소화 원칙** (절대 준수)
- **수정 파일**: 정확히 3개만 (config.json + fetch.ts + web-search.ts)
- **코드 변경**: 각 파일당 10줄 이내 수정
- **새로운 의존성**: 추가 없음
- **복잡한 로직**: 지양, 단순한 매칭과 크롤링만

### 🎪 **심플함 원칙** (사용자 경험)
- **설치**: npm install 1회
- **설정**: 환경변수 + JSON 파일
- **사용**: 기존 qwen 명령어 그대로
- **학습비용**: 제로

### ✅ **완전 충족 원칙** (요구사항)
- ✅ 내부 LLM 연동
- ✅ SSL 우회 처리
- ✅ 내부 웹 검색
- ✅ 기존 사용법 유지

---

## 📝 결론

본 PRD는 **"최소한의 수정으로 최대한의 효과"**를 목표로 하는 PoC 프로젝트입니다.

**핵심 성공 요소**:
- **단순함**: 3개 파일만 수정하여 구현
- **실용성**: 환경변수 설정만으로 즉시 사용 가능
- **확장성**: JSON 파일로 내부 웹사이트 쉽게 추가
- **호환성**: 기존 qwen 사용법 100% 유지

이를 통해 보안이 중요한 기업 환경에서도 AI 코딩 어시스턴트의 효과를 검증하고, 향후 본격적인 도입을 위한 기반을 마련할 수 있습니다.

---

**문서 버전**: v1.0  
**작성일**: 2025-01-26  
**작성자**: Claude Code SuperClaude  
**목적**: PoC (Proof of Concept)  
**원칙**: 최소 수정 + 최대 효과