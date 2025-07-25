/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  performQuickDiagnosis,
  isInternalLlmMode,
} from '@qwen-code/qwen-code-core';
import { CommandContext } from './types.js';

export async function handleDiagnoseCommand(
  context: CommandContext,
): Promise<string> {
  // 내부망 LLM 모드가 아닌 경우
  if (!isInternalLlmMode()) {
    return `
❌ 내부망 LLM 모드가 아닙니다.

현재 모드에서는 진단이 필요하지 않습니다.
내부망 모드를 활성화하려면:

1. 환경변수 설정: QWEN_AUTH_TYPE=internal-llm
2. 또는 .env 파일에 INTERNAL_LLM_* 변수 설정

자세한 설정 방법은 'qwen /help' 명령어를 참고하세요.
`;
  }

  try {
    const diagnosticResult = await performQuickDiagnosis();
    
    return `${diagnosticResult}

🔧 추가 도구:
  • 상세 검증: qwen /validate
  • 테스트 서버: npm run test:proxy
  • 디버그 모드: DEBUG=1 qwen`;
    
  } catch (error) {
    return `
❌ 진단 실행 중 오류 발생:

${error instanceof Error ? error.message : String(error)}

기본적인 확인사항:
1. 환경변수가 올바르게 설정되었는지 확인
2. 네트워크 연결 상태 확인
3. 서버가 실행 중인지 확인
`;
  }
}

export const diagnoseCommand = {
  name: 'diagnose',
  altName: 'diag',
  description: '내부망 LLM 연결 문제를 빠르게 진단합니다',
  action: async (context: CommandContext): Promise<{ type: 'message'; messageType: 'info' | 'error'; content: string } | undefined> => {
    const result = await handleDiagnoseCommand(context);
    return {
      type: 'message',
      messageType: 'info',
      content: result,
    };
  },
};