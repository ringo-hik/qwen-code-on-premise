# 2. 사용자 가이드 및 개발 철학

## 2.1. 개발 철학

### 핵심 원칙: **최소 수정, 최대 효과**

Qwen Code On-Premise는 보안이 중요한 폐쇄형 기업 네트워크 환경의 요구사항을 이해하고, 안정성과 보안을 최우선으로 하는 철학 하에 개발되었습니다.

### 설계 원칙

#### 1. **단순함이 최우선**
- **원클릭 설치**: `npm install -g .` 한 줄로 완료
- **환경변수 설정**: 복잡한 설정 파일 대신 간단한 환경변수 활용
- **기존 인터페이스 유지**: 학습 곡선 없이 기존 `qwen` 명령어 그대로 사용

#### 2. **격리된 변경사항**
- **모듈별 독립성**: 각 기능별로 완전히 분리된 구현
- **조건부 활성화**: 내부 환경에서만 특수 기능 동작
- **기존 코드 보존**: 원본 기능에 영향 없는 안전한 확장

#### 3. **새로운 의존성 금지**
- **기존 런타임 활용**: Node.js 표준 라이브러리만 사용
- **보안 최우선**: 외부 패키지 추가로 인한 보안 위험 제거
- **설치 간소화**: 복잡한 의존성 없는 깔끔한 설치

#### 4. **사용자 권한 강화**
- **설정 파일 중심**: `internal-web-config.json`을 통한 완전한 커스터마이징
- **코드 수정 불필요**: 내부 웹사이트 추가/제거를 설정 파일로만 관리
- **조직별 적응**: 각 기업의 내부 시스템에 맞는 유연한 설정

## 2.2. 설치 및 설정 가이드

### 시스템 요구사항
- **Node.js**: 20.0.0 이상
- **메모리**: 최소 512MB (권장 1GB)
- **네트워크**: 내부 LLM 서버 접근 가능
- **권한**: npm 글로벌 패키지 설치 권한

### 설치 프로세스

#### 1단계: 프로젝트 준비
```bash
# 저장소 클론 (내부 Git 서버에서)
git clone http://internal-git.company.com/ai-tools/qwen-code-on-premise.git
cd qwen-code-on-premise

# 의존성 설치 및 빌드
npm install
```

#### 2단계: 글로벌 설치
```bash
# 전역 설치로 어디서나 qwen 명령어 사용 가능
npm install -g .

# 설치 확인
qwen --version
```

#### 3단계: 환경 설정

**자동 설정 (Windows):**
```powershell
# PowerShell에서 자동 설정 실행
.\on-premise-setup.ps1

# API 키 수정 (스크립트 내 OPENAI_API_KEY 부분)
# $env:OPENAI_API_KEY = "sk-or-your-actual-api-key"
```

**수동 설정 (Linux/macOS):**
```bash
# 환경변수 설정
export OPENAI_BASE_URL="http://internal-llm.company.com:8080/v1"
export OPENAI_API_KEY="your-internal-api-key"
export OPENAI_MODEL="qwen/qwen3-235b-a22b-2507"
export NODE_TLS_REJECT_UNAUTHORIZED="0"
export INTERNAL_WEB_CONFIG_PATH="./internal-web-config.json"

# 설정 영구 적용
echo 'export OPENAI_BASE_URL="http://internal-llm.company.com:8080/v1"' >> ~/.bashrc
echo 'export OPENAI_API_KEY="your-internal-api-key"' >> ~/.bashrc
echo 'export NODE_TLS_REJECT_UNAUTHORIZED="0"' >> ~/.bashrc
source ~/.bashrc
```

#### 4단계: 내부 웹 검색 설정

기본 제공되는 `internal-web-config.json` 파일을 조직에 맞게 수정:

```json
{
  "enabled": true,
  "timeout": 10000,
  "urls": {
    "company_wiki": {
      "url": "http://wiki.yourcompany.com",
      "description": "회사 내부 위키 및 개발 문서",
      "categories": ["documentation", "technical"],
      "keywords": ["개발", "가이드", "문서", "API"],
      "priority": 10
    },
    "api_docs": {
      "url": "http://api-docs.yourcompany.com",
      "description": "내부 API 문서 및 레퍼런스",
      "categories": ["api", "reference"],
      "keywords": ["API", "인증", "엔드포인트", "REST"],
      "priority": 9
    }
  }
}
```

#### 5단계: 연결 테스트

```bash
# 기본 연결 테스트
qwen "안녕하세요! 연결이 잘 되었나요?"

# 내부 웹 검색 테스트
qwen "API 인증 방법을 내부 문서에서 찾아주세요"

# 코드 분석 테스트
qwen "현재 디렉토리의 TypeScript 프로젝트를 분석해주세요"
```

## 2.3. 고급 사용자 가이드

### 내부 웹 검색 최적화

#### URL 점수 계산 이해하기
내부 웹 검색은 다음 요소들을 종합하여 가장 적합한 웹사이트를 선택합니다:

1. **키워드 매칭** (40% 가중치)
   - 사용자 쿼리의 키워드와 설정된 키워드 일치도
   - 예: "API 문서" 검색 시 keywords에 "API"가 있는 사이트 우선

2. **설명 매칭** (40% 가중치)
   - 자연어 설명과 쿼리의 관련성
   - 예: "인증 방법" 검색 시 description에 "인증"이 포함된 사이트 우선

3. **카테고리 매칭** (20% 가중치)
   - 카테고리 분류와 쿼리 의도 일치도
   - 예: 기술 문서 검색 시 categories에 "technical"이 있는 사이트 우선

4. **우선순위 보정** (10% 가중치)
   - 수동으로 설정한 priority 값 (1-10)
   - 중요한 내부 사이트에 높은 우선순위 부여

#### 설정 파일 고급 옵션

```json
{
  "search_config": {
    "min_score_threshold": 0.3,    // 최소 점수 (낮을수록 더 많은 결과)
    "max_results": 3,              // 최대 검색할 사이트 수
    "enable_fuzzy_match": true,    // 유사 키워드 매칭 활성화
    "keyword_weight": 0.4,         // 키워드 매칭 가중치
    "description_weight": 0.4,     // 설명 매칭 가중치
    "category_weight": 0.2,        // 카테고리 매칭 가중치
    "priority_weight": 0.1         // 우선순위 가중치
  },
  "crawl_config": {
    "max_page_size": 1048576,      // 최대 페이지 크기 (1MB)
    "follow_redirects": true,      // 리다이렉트 따라가기
    "parse_html": true,            // HTML 파싱 활성화
    "remove_scripts": true,        // JavaScript 제거
    "remove_styles": true,         // CSS 제거
    "text_only": true              // 텍스트만 추출
  }
}
```

### 환경별 최적화

#### 개발 환경
```bash
# 디버그 모드로 상세 로그 확인
DEBUG=1 qwen "코드 분석 요청"

# 특정 모델 지정
OPENAI_MODEL="qwen/qwen2.5-coder-32b-instruct" qwen "코드 최적화"
```

#### 운영 환경
```bash
# 타임아웃 설정 (내부 네트워크가 느린 경우)
export OPENAI_TIMEOUT=30000  # 30초

# 로그 레벨 조정
export LOG_LEVEL=error  # error, warn, info, debug
```

### 팀 설정 공유

#### 설정 파일 템플릿 생성
```bash
# 팀용 설정 템플�트 생성
cp internal-web-config.json internal-web-config.template.json

# 민감한 정보 제거 후 Git에 커밋
git add internal-web-config.template.json
```

#### 환경변수 파일 관리
```bash
# .env 파일 생성 (개인용)
cat > .env << EOF
OPENAI_BASE_URL=http://internal-llm.company.com:8080/v1
OPENAI_API_KEY=your-personal-api-key
OPENAI_MODEL=qwen/qwen3-235b-a22b-2507
NODE_TLS_REJECT_UNAUTHORIZED=0
INTERNAL_WEB_CONFIG_PATH=./internal-web-config.json
EOF

# Git에서 .env 파일 제외
echo ".env" >> .gitignore
```

## 2.4. 문제 해결 및 최적화

### 일반적인 문제 해결

#### 설치 문제
**문제**: `npm install -g .` 권한 오류
```bash
# 해결책 1: sudo 사용 (Linux/macOS)
sudo npm install -g .

# 해결책 2: npm 글로벌 경로 변경
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**문제**: `qwen: command not found`
```bash
# 진단: npm 글로벌 경로 확인
npm config get prefix
npm list -g --depth=0

# 해결책: PATH 환경변수에 추가
export PATH=$(npm config get prefix)/bin:$PATH
```

#### 연결 문제
**문제**: `ECONNREFUSED` 오류
```bash
# 진단: 내부 LLM 서버 접근 확인
curl -X POST "$OPENAI_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "test", "messages": [{"role": "user", "content": "test"}]}'

# 해결책: 네트워크 및 방화벽 확인
ping your-llm-server.company.com
telnet your-llm-server.company.com 8080
```

**문제**: SSL 인증서 오류
```bash
# 진단: TLS 설정 확인
echo $NODE_TLS_REJECT_UNAUTHORIZED

# 해결책: SSL 우회 설정
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

#### 성능 문제
**문제**: 응답 속도 느림
```bash
# 해결책 1: 타임아웃 증가
export OPENAI_TIMEOUT=60000  # 60초

# 해결책 2: 내부 웹 검색 결과 수 제한
# internal-web-config.json에서 max_results를 1로 설정

# 해결책 3: 캐싱 활성화
# internal-web-config.json에서 cache_enabled: true 설정
```

### 성능 최적화 팁

#### 1. 내부 웹 검색 최적화
- **결과 수 제한**: `max_results`를 1-2개로 설정
- **점수 임계값 조정**: `min_score_threshold`를 0.5 이상으로 설정
- **캐싱 활용**: `cache_enabled: true`, `cache_ttl: 3600` 설정

#### 2. 모델 선택 최적화
- **빠른 응답**: 더 작은 모델 사용 (예: qwen2.5-coder-7b)
- **정확성 우선**: 더 큰 모델 사용 (예: qwen3-235b)

#### 3. 네트워크 최적화
- **지역 LLM 서버**: 물리적으로 가까운 서버 사용
- **전용 네트워크**: 내부 LLM 트래픽용 전용 네트워크 구성

### 보안 고려사항

#### SSL 우회 보안
- **내부 네트워크만**: `NODE_TLS_REJECT_UNAUTHORIZED=0`은 내부 네트워크에서만 사용
- **방화벽 설정**: 외부 접근 차단 확인
- **감사 로그**: SSL 우회 사용 시 보안 감사 로그 남기기

#### API 키 관리
- **개인별 API 키**: 팀원별 개별 API 키 사용
- **권한 제한**: 필요한 최소 권한만 부여
- **정기 교체**: API 키 정기적 교체 정책 수립

#### 내부 웹 검색 보안
- **접근 제한**: 내부 웹사이트 접근 권한 검증
- **내용 필터링**: 민감한 정보 자동 필터링 설정
- **로그 관리**: 검색 내역 로그 및 보안 감사

---

**최종 업데이트**: 2025-01-27  
**문서 버전**: 2.0 (실제 구현에 맞춰 단순화)