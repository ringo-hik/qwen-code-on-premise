# Qwen Code - Simplified OpenRouter Version

이 버전은 온프레미스 환경에서 OpenRouter를 통해 외부 LLM 서비스를 이용할 수 있도록 단순화된 Qwen Code CLI입니다.

## 특징

- **단순 설정**: .env 파일 3줄 설정만으로 즉시 사용 가능
- **OpenRouter 전용**: OpenRouter.ai API를 통한 다양한 LLM 모델 접근
- **SSL 우회**: 온프레미스 환경을 위해 SSL 인증서 검증 자동 비활성화
- **즉시 실행**: 모델/URL 선택 UI 없이 바로 실행

## 설치 및 설정

### 1. 리포지토리 클론
```bash
git clone <repository-url>
cd qwen-code
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 글로벌 설치
```bash
npm run install-global
```

### 4. API 키 설정
```bash
# ~/.qwen/.env 파일 편집
OPENAI_API_KEY=your-openrouter-api-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3.5-sonnet
```

## 사용법

### 대화형 모드
```bash
qwen
```

### 직접 질문
```bash
qwen "코드를 분석해주세요"
```

### 파이프 입력
```bash
echo "이 오류를 해결해주세요" | qwen
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenRouter API 키 (필수) | - |
| `OPENAI_BASE_URL` | OpenRouter API URL | `https://openrouter.ai/api/v1` |
| `OPENAI_MODEL` | 사용할 모델명 | `anthropic/claude-3.5-sonnet` |

## 지원 모델

OpenRouter에서 지원하는 모든 모델을 사용할 수 있습니다:
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4`
- `qwen/qwen-2.5-coder-32b-instruct`
- `meta-llama/llama-3.1-70b-instruct`
- 기타 등등...

자세한 모델 목록은 [OpenRouter 모델 페이지](https://openrouter.ai/models)를 참조하세요.

## 온프레미스 배포

1. 내부 서버에 코드 배포
2. `.env` 파일에 OpenRouter API 키 설정
3. 사용자들에게 `npm run install-global` 실행 안내
4. 모든 사용자가 `qwen` 명령어로 즉시 사용 가능

## 문제 해결

### SSL 인증서 오류
- 자동으로 SSL 검증이 비활성화되므로 추가 설정 불필요

### API 키 오류
- `~/.qwen/.env` 파일에서 `OPENAI_API_KEY` 확인
- OpenRouter에서 유효한 API 키 발급 필요

### 모델 지원 오류
- 도구 사용(tool use)을 지원하는 모델 선택 필요
- 권장: `anthropic/claude-3.5-sonnet` 또는 `openai/gpt-4`

## 변경 사항

기존 복잡한 Qwen Code에서 다음 사항이 단순화되었습니다:

### 제거된 기능
- 내부망 LLM 서버 연결
- 프록시 서버 기능
- 복수 인증 방식 선택 UI
- 모델 선택 UI
- 복잡한 설정 마법사

### 추가된 기능
- OpenRouter 전용 최적화
- 자동 SSL 우회 설정
- 글로벌 .env 설정 관리
- 즉시 실행 가능한 단순 인터페이스

## 라이선스

Apache 2.0 License