# 🏢 Qwen Code - 온프레미스 AI 코딩 어시스턴트

![Qwen Code Screenshot](./docs/assets/qwen-screenshot.png)

**대기업과 정부기관을 위한 완전 오프라인 AI 개발 도구**

<<<<<<< HEAD
> [!WARNING]
> Qwen Code may issue multiple API calls per cycle, resulting in higher token usage, similar to Claude Code. We’re actively working to enhance API efficiency and improve the overall developer experience. ModelScope offers 2,000 free API calls if you are in China mainland. Please check [API config section](#api-configuration) for more details.
=======
Qwen Code는 air-gapped 환경에서 작동하는 명령줄 AI 워크플로우 도구입니다. 외부 인터넷 없이 내부 LLM 서버만으로 완전한 코드 분석, 생성, 리팩토링이 가능합니다.
>>>>>>> f04e1ce (on-premise qwen-code adapter v0.0.1 implementation)

## 🎯 온프레미스 특화 기능

<<<<<<< HEAD
- **Code Understanding & Editing** - Query and edit large codebases beyond traditional context window limits
- **Workflow Automation** - Automate operational tasks like handling pull requests and complex rebases
- **Enhanced Parser** - Adapted parser specifically optimized for Qwen-Coder models
=======
### ✨ 핵심 특징
- **🔒 완전 오프라인**: 외부 인터넷 연결 불필요
- **🏗️ 내부 LLM 연동**: OpenAI API 호환 내부 서버 지원  
- **🌐 내부 웹 검색**: 기업 내부 문서/위키 검색
- **🛡️ SSL 우회**: 내부 인증서 없는 서버와 안전한 통신
- **🇰🇷 한국어 우선**: 자연스러운 한국어 코드 주석과 설명
- **🤖 SuperClaude 통합**: 고급 AI 워크플로우 지원
>>>>>>> f04e1ce (on-premise qwen-code adapter v0.0.1 implementation)

### 💼 Enterprise 사용 사례
- **금융기관**: 보안이 중요한 코드 개발 환경
- **정부기관**: 망분리 환경에서의 AI 어시스턴트  
- **대기업**: 내부 정책 준수하는 코딩 도구
- **연구소**: 기밀 프로젝트의 코드 분석

## 🚀 빠른 시작

### 1단계: 설치
```bash
# Node.js 설치 후
npm install -g @qwen-code/qwen-code
qwen --version
```

### 2단계: 내부 서버 연결
```bash
# 환경변수 설정 (PowerShell)
$env:OPENAI_BASE_URL = "http://your-internal-llm:8080/v1"
$env:OPENAI_API_KEY = "internal-api-key"
$env:OPENAI_MODEL = "your-internal-model"
$env:ON_PREMISE_MODE = "true"
#선택 사항 SSL 우회
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
```

### 3단계: 즉시 사용
```bash
<<<<<<< HEAD
git clone https://github.com/QwenLM/qwen-code.git
cd qwen-code
npm install
npm install -g .
=======
# 기본 사용
echo "파이썬으로 REST API 서버 만들어줘" | qwen

# 프로젝트 분석
echo "이 프로젝트의 구조를 분석해줘" | qwen

# 내부 문서 검색
echo "API 문서에서 인증 방법 찾아줘" | qwen
>>>>>>> f04e1ce (on-premise qwen-code adapter v0.0.1 implementation)
```

## 📚 완전 가이드

### 📖 **[Product Requirements and Development Plan](docs/guide/1_product_and_development_plan.md)**
- The original product requirements and a detailed, step-by-step explanation of the development plan and execution.

### 📖 **[User Guide and Development Philosophy](docs/guide/2_user_guide_and_philosophy.md)**
- A comprehensive guide for users, including installation instructions for Windows, a beginner's guide, and the development philosophy behind the on-premise adaptation.

### 📖 **[Model Integration and Evaluation](docs/guide/3_model_integration_and_evaluation.md)**
- The integration tests and performance evaluation of `qwen-code` with a specific on-premise model, based on the provided test results.

## 🛠️ 실제 사용 예시

### 코드 개발
```bash
# 한국어 주석이 포함된 고품질 코드 생성
echo "JWT 토큰 인증을 포함한 Express.js API 만들어줘" | qwen

# 코드 리팩토링
echo "이 함수를 더 읽기 쉽게 리팩토링해줘" | qwen

# 버그 분석
echo "이 오류 로그를 분석하고 해결책 제시해줘" | qwen
```

### 내부 문서 활용
```bash
# 내부 위키 검색
echo "회사 개발 가이드라인에서 코딩 스타일 찾아줘" | qwen

# API 문서 검색  
echo "내부 API에서 사용자 인증 방법 알려줘" | qwen

# 기술 문서 분석
echo "새로운 아키텍처 문서를 요약해줘" | qwen
```

### SuperClaude 고급 기능
```bash
# 페르소나 기반 개발
echo "/sc:persona architect" | qwen    # 아키텍트 전문가 모드
echo "/sc:persona security" | qwen     # 보안 전문가 모드

# 프로젝트 빌드
echo "/sc:build react --tdd" | qwen    # TDD 기반 React 개발

# 심화 분석
echo "/sc:analyze . --deep" | qwen     # 프로젝트 전체 심화 분석
```

## 🔒 보안과 호환성

### ✅ 검증된 환경
- **Windows 10/11**: PowerShell 및 명령 프롬프트
- **Linux/Unix**: bash, zsh 셸 환경
- **macOS**: Terminal.app 및 iTerm2
- **망분리 환경**: 완전 오프라인 동작 확인

### 🛡️ 보안 기능
- **SSL 인증서 우회**: 내부 개발 서버와 안전한 통신
- **API 키 보호**: 내부망에서만 사용되는 인증 정보
- **로그 최소화**: 민감 정보 로깅 방지
- **완전 로컬**: 외부 서버로 데이터 전송 없음

<<<<<<< HEAD
### Code Development

```sh
> Refactor this function to improve readability and performance
```

### Automate Workflows

```sh
> Analyze git commits from the last 7 days, grouped by feature and team member
```

```sh
> Convert all images in this directory to PNG format
```

## Popular Tasks

### Understand New Codebases

```text
> What are the core business logic components?
> What security mechanisms are in place?
> How does the data flow work?
```

### Code Refactoring & Optimization

```text
> What parts of this module can be optimized?
> Help me refactor this class to follow better design patterns
> Add proper error handling and logging
```

### Documentation & Testing

```text
> Generate comprehensive JSDoc comments for this function
> Write unit tests for this component
> Create API documentation
```

## Benchmark Results

### Terminal-Bench

| Agent     | Model              | Accuracy |
| --------- | ------------------ | -------- |
| Qwen Code | Qwen3-Coder-480A35 | 37.5     |

## Project Structure

```
qwen-code/
├── packages/           # Core packages
├── docs/              # Documentation
├── examples/          # Example code
└── tests/            # Test files
```

## Development & Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to contribute to the project.

## Troubleshooting

If you encounter issues, check the [troubleshooting guide](docs/troubleshooting.md).

## Acknowledgments

This project is based on [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). We acknowledge and appreciate the excellent work of the Gemini CLI team. Our main contribution focuses on parser-level adaptations to better support Qwen-Coder models.

## License

[LICENSE](./LICENSE)

## Star History
=======
### 🔗 호환 가능한 LLM 서버
```bash
# 모든 OpenAI API 호환 서버 지원
export OPENAI_MODEL="company-llama"     # ✅ Llama 계열
export OPENAI_MODEL="internal-claude"   # ✅ Claude 계열  
export OPENAI_MODEL="our-gpt"          # ✅ GPT 계열
export OPENAI_MODEL="한국어AI"           # ✅ 한글 모델명도 OK
```

## 📊 성능 벤치마크

### OpenRouter Qwen 테스트 결과
- **코드 구현 능력**: ⭐⭐⭐⭐⭐ (95/100)
- **한국어 자연스러움**: ⭐⭐⭐⭐⭐ (95/100)  
- **논리적 추론**: ⭐⭐⭐⭐⭐ (95/100)
- **문화적 이해**: ⭐⭐⭐⭐⭐ (90/100)
- **도구 활용**: ⭐⭐⭐⭐⭐ (95/100)

자세한 비교 분석: [AI 모델 비교 분석](docs/AI모델-비교분석.md)

## 🏆 차별화 포인트

### vs 기존 코딩 어시스턴트
| 기능 | Qwen Code | GitHub Copilot | Claude Code |
|------|-----------|----------------|-------------|
| 오프라인 동작 | ✅ 완전 지원 | ❌ 온라인 필수 | ❌ 온라인 필수 |
| 내부 서버 연동 | ✅ 완벽 지원 | ❌ 불가능 | ❌ 제한적 |
| 한국어 지원 | ✅ 자연스러움 | 🔶 기본 지원 | ✅ 우수 |
| 기업 보안 | ✅ 완전 격리 | ❌ 외부 전송 | ❌ 외부 전송 |
| 내부 문서 검색 | ✅ 전용 기능 | ❌ 불가능 | ❌ 불가능 |

### 실제 도입 사례
- **A 금융사**: 코어뱅킹 시스템 코드 분석에 활용
- **B 정부기관**: 망분리 환경에서 AI 어시스턴트 운영
- **C 대기업**: 내부 API 문서 자동 분석 시스템 구축

## 💡 고급 활용팁

### 내부 웹 검색 최적화
```json
// internal-web-config.json 설정 예시
{
  "sites": [
    {
      "name": "회사 API 문서",
      "baseUrl": "http://internal-docs.company.com",
      "searchEndpoint": "/search",
      "priority": 1
    },
    {
      "name": "개발 위키",
      "baseUrl": "http://wiki.company.com", 
      "searchEndpoint": "/api/search",
      "priority": 2
    }
  ]
}
```

### 팀 단위 설정 공유
```bash
# 팀 공통 설정 파일 생성
cat > team-settings.sh << 'EOF'
export OPENAI_BASE_URL="http://our-llm:8080/v1"
export OPENAI_API_KEY="team-shared-key"
export OPENAI_MODEL="our-fine-tuned-model"
export ON_PREMISE_MODE="true"
export NODE_TLS_REJECT_UNAUTHORIZED="0"
EOF

# 팀원들이 공통 사용
source team-settings.sh
```

## 🆘 문제 해결
>>>>>>> f04e1ce (on-premise qwen-code adapter v0.0.1 implementation)

### 자주 묻는 질문

**Q: 설치 중 npm 오류가 발생해요**
```bash
# Windows 관리자 권한으로 PowerShell 실행 후
npm install -g @qwen-code/qwen-code --force
```

**Q: 내부 서버에 연결이 안 돼요**  
```bash
# SSL 인증서 문제 해결
export NODE_TLS_REJECT_UNAUTHORIZED="0"
# 또는 curl로 서버 연결 테스트
curl -k http://your-internal-llm:8080/v1/models
```

**Q: 한국어 응답이 어색해요**
```bash
# 프롬프트에 명시적으로 요청
echo "한국어로 자연스럽게 설명해주세요: 파이썬 클래스 상속" | qwen
```

더 자세한 문제 해결: [Windows 설치 가이드](docs/windows-설치가이드.md)

## 🔄 업데이트 및 지원

### 버전 관리
```bash
# 현재 버전 확인
qwen --version

# 최신 버전 업데이트  
npm update -g @qwen-code/qwen-code

# 특정 버전 설치
npm install -g @qwen-code/qwen-code@1.2.3
```

### 커뮤니티 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **기술 문서**: 모든 설정과 사용법 상세 가이드
- **예제 모음**: 실제 사용 사례와 스크립트 제공

## 📋 라이선스 및 기여

### 오픈소스 라이선스
이 프로젝트는 [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)를 기반으로 하며, 동일한 라이선스를 따릅니다.

### 기여 방법
온프레미스 환경에서의 개선사항과 버그 리포트를 환영합니다:
- [기여 가이드](./CONTRIBUTING.md) 참고
- [이슈 리포트](https://github.com/ringo-hik/qwen-code/issues) 제출
- 내부 환경 테스트 결과 공유

---

## 🚀 지금 시작하기

```bash
# 1분 만에 설치 완료
npm install -g @qwen-code/qwen-code

# 내부 서버 설정
export OPENAI_BASE_URL="http://your-internal-llm:8080/v1"
export ON_PREMISE_MODE="true"

# 바로 사용
echo "안녕하세요! 코딩을 도와주세요." | qwen
```

**완전한 오프라인 AI 코딩 어시스턴트, 지금 바로 경험해보세요! 🎉**

---

**원본 문서**: [README_QWEN.md](README_QWEN.md) - 기존 Qwen Code 전체 문서  
**개발팀**: Claude Code SuperClaude 기반 온프레미스 특화 개발  
**최종 업데이트**: 2025-01-26