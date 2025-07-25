#!/usr/bin/env node

/**
 * 글로벌 내부망 LLM 설정 스크립트
 */

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const USER_SETTINGS_DIR = path.join(homedir(), '.qwen');
const GLOBAL_ENV_PATH = path.join(USER_SETTINGS_DIR, '.env');

console.log('🔧 Qwen Code 글로벌 내부망 LLM 설정을 진행합니다...');

// .qwen 디렉토리 생성
if (!fs.existsSync(USER_SETTINGS_DIR)) {
  fs.mkdirSync(USER_SETTINGS_DIR, { recursive: true });
  console.log(`📁 설정 디렉토리를 생성했습니다: ${USER_SETTINGS_DIR}`);
}

// 글로벌 .env 파일 생성
const globalEnvContent = `# Qwen Code 글로벌 내부망 LLM 설정
# 이 파일이 있으면 어디서든 qwen 명령어가 내부망 모드로 실행됩니다

# 내부망 LLM API 설정 (테스트용 프록시 서버)
INTERNAL_LLM_BASE_URL=http://localhost:8443/devport/api/v1
INTERNAL_LLM_API_KEY=test-key
INTERNAL_LLM_MODEL=internal-llm-model

# SSL 인증서 검증 우회 (테스트용)
NODE_TLS_REJECT_UNAUTHORIZED=0

# 주석: 위 설정들이 있으면 qwen 명령어가 자동으로 내부망 모드로 실행됩니다
# 일반 모드로 돌아가려면 이 파일을 삭제하거나 이름을 변경하세요 (.env.backup 등)
`;

fs.writeFileSync(GLOBAL_ENV_PATH, globalEnvContent);
console.log(`✅ 글로벌 설정 파일을 생성했습니다: ${GLOBAL_ENV_PATH}`);

console.log(`
🎉 설정 완료!

이제 어떤 디렉토리에서든 'qwen' 명령어를 실행하면 내부망 LLM 모드로 동작합니다.

사용 방법:
1. 테스트 프록시 서버 실행: node ${path.resolve('test-proxy-server.js')}
2. 아무 디렉토리에서: qwen

설정 해제:
- 파일 삭제: rm "${GLOBAL_ENV_PATH}"
- 또는 파일 이름 변경: mv "${GLOBAL_ENV_PATH}" "${GLOBAL_ENV_PATH}.backup"

설정 파일 위치: ${GLOBAL_ENV_PATH}
`);