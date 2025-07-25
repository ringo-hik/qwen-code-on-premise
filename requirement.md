
---

# ✅ Qwen CLI 내부망 연동 요구사항 정의서

## 📌 목표

Qwen CLI를 내부망 환경에서도 사용할 수 있도록 수정한다. OpenAI API 호환 구조를 유지하면서도, 다음과 같은 환경에 대응한다:

* 외부망 접속이 불가능한 내부망 환경
* 자체 LLM 서버 또는 프록시 서버를 통한 우회
* SSL 인증서 우회 및 자체 서명 인증서 허용
* CLI 명령어 `qwen`으로 글로벌 실행 가능

---

## 🧩 주요 기능 요구사항

### 1. 글로벌 CLI 실행 지원

* `npm install -g` 설치 시 **`qwen` 명령어로 CLI 실행 가능**해야 함.
* 설치 후 실행 명령:

  ```bash
  qwen
  ```

---

### 2. `.env` 기반 설정 지원

`.env` 파일을 통해 아래 항목들을 설정 가능해야 하며, 이를 통해 CLI 실행 시 환경 자동 감지 및 세팅 가능해야 함:

| 항목             | 환경변수               | 설명                                         |
| -------------- | ------------------ | ------------------------------------------ |
| 내부망 LLM 서버 주소  | `LLM_BASE_URL`     | OpenAI 호환 내부망 서버 주소. 설정 시 프록시 서버 대신 직접 통신. |
| 테스트용 프록시 서버 주소 | `PROXY_SERVER_URL` | 내부망 LLM 서버가 없을 경우 사용. CLI가 이 서버로 요청 전달.    |
| SSL 인증 우회 해제   | `DISABLE_SSL_SKIP` | 기본적으로 SSL 인증 우회는 적용되며, 이 설정이 true일 경우 무시됨. |

#### 설정 우선순위

1. `LLM_BASE_URL`이 설정되어 있으면 **내부망 서버와 직접 통신**.
2. `LLM_BASE_URL`이 없고 `PROXY_SERVER_URL`이 설정되어 있으면 **프록시 서버로 요청**.
3. 둘 다 없으면 실행 중단 및 오류 메시지 출력.

#### 예시 `.env`

```env
LLM_BASE_URL=https://10.0.0.2:8443/v1/chat/completions
PROXY_SERVER_URL=https://localhost:443/devporta/v1/chat/completions
DISABLE_SSL_SKIP=true
```

---

### 3. SSL 인증서 우회 (기본 적용)

* 기본적으로 SSL 인증서 검증을 우회하도록 설정되어야 한다.
* 셀프 사인 인증서도 통과 가능해야 함.
* `.env` 파일에 `DISABLE_SSL_SKIP=true`로 설정된 경우에만 우회 동작 비활성화 가능.

---

### 4. 테스트용 프록시 서버 (test-proxy-server.js)

* `test-proxy-server.js` 파일은 다음 조건을 충족해야 함:

  * `.env`에서 지정된 `PROXY_SERVER_URL`을 통해 외부 LLM(OpenRouter 등)에 요청을 전달
  * 내부망 LLM 서버가 없을 경우 대체 역할 수행
  * 요청/응답 로깅 가능
  * 인증 토큰을 `.env`에서 자동 로딩 가능 (`OPENROUTER_API_KEY` 등)

---

### 5. 소스코드 변경 최소화

* `qwen-code`의 원본 CLI 코드에는 **최소한의 변경만 허용**.
* 프록시 처리, 인증, SSL 등 대부분의 처리는 **`test-proxy-server.js`에서 독립적으로 수행**해야 한다.

---

### 6. 기타 부가 요구사항

* `quick-setup.sh` / `quick-setup.bat` 스크립트를 통해 초기 `.env` 생성 및 기본값 자동 설정
* 사용자 친화적인 **한글 README.md** 제공
* Windows / Linux 환경 모두 지원

---

## ✅ 정리 요약

| 기능         | 설명                                     |
| ---------- | -------------------------------------- |
| CLI 명령어    | `qwen`                                 |
| 설치 방식      | 글로벌 npm 패키지 설치 지원                      |
| 내부망 LLM 연결 | `LLM_BASE_URL` 설정 시 직접 연결              |
| 프록시 서버 연결  | `PROXY_SERVER_URL` 설정 시 프록시를 통해 연결     |
| SSL 인증 우회  | 기본 적용 (`DISABLE_SSL_SKIP=true`로 해제 가능) |
| 설정 방식      | `.env` 자동 감지 방식                        |
| 변경 위치      | 핵심 CLI 코드 변경 최소화, 프록시는 별도 구현           |

---