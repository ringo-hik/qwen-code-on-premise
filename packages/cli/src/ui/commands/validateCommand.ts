/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  InternalLlmValidator,
  getCurrentInternalLlmConfig,
  isInternalLlmMode,
  ValidationResult,
} from '@qwen-code/qwen-code-core';
import { CommandContext } from './types.js';

export async function handleValidateCommand(
  context: CommandContext,
): Promise<string> {
  // 내부망 LLM 모드가 아닌 경우
  if (!isInternalLlmMode()) {
    return `
❌ 내부망 LLM 모드가 아닙니다.

내부망 모드를 활성화하려면:
1. 환경변수 설정: QWEN_AUTH_TYPE=internal-llm
2. 또는 .env 파일에 INTERNAL_LLM_* 변수 설정

자세한 설정 방법은 'qwen help' 명령어를 참고하세요.
`;
  }

  const config = getCurrentInternalLlmConfig();
  const validator = new InternalLlmValidator(config);
  
  const validationResult = await validator.validateConfiguration();
  
  return formatValidationResult(validationResult);
}

function formatValidationResult(result: ValidationResult): string {
  const statusIcon = result.isValid ? '✅' : '❌';
  const connectionIcon = getConnectionIcon(result.connectionStatus);
  
  let output = `
${statusIcon} 내부망 LLM 설정 검증 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 연결 상태: ${connectionIcon} ${getConnectionStatusText(result.connectionStatus)}`;

  if (result.responseTime !== undefined) {
    output += `\n⏱️  응답 시간: ${result.responseTime}ms`;
  }

  // 오류 메시지
  if (result.errors.length > 0) {
    output += `\n\n❌ 오류:`;
    for (const error of result.errors) {
      output += `\n  • ${error}`;
    }
  }

  // 경고 메시지
  if (result.warnings.length > 0) {
    output += `\n\n⚠️  경고:`;
    for (const warning of result.warnings) {
      output += `\n  • ${warning}`;
    }
  }

  // 성공 메시지
  if (result.isValid && result.connectionStatus === 'connected') {
    output += `\n\n🎉 모든 검증을 통과했습니다! 내부망 LLM을 사용할 준비가 되었습니다.`;
  }

  // 진단 정보
  output += `\n\n${InternalLlmValidator.generateDiagnosticInfo()}`;

  // 문제 해결 가이드
  if (!result.isValid || result.connectionStatus === 'failed') {
    output += generateTroubleshootingGuide(result);
  }

  return output;
}

function getConnectionIcon(status: ValidationResult['connectionStatus']): string {
  switch (status) {
    case 'connected': return '🟢';
    case 'failed': return '🔴';
    case 'untested': return '⚪';
  }
}

function getConnectionStatusText(status: ValidationResult['connectionStatus']): string {
  switch (status) {
    case 'connected': return '연결됨';
    case 'failed': return '연결 실패';
    case 'untested': return '테스트되지 않음';
  }
}

function generateTroubleshootingGuide(result: ValidationResult): string {
  let guide = `
🔧 문제 해결 가이드:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  // 설정 오류 해결
  if (result.errors.some(e => e.includes('INTERNAL_LLM_BASE_URL'))) {
    guide += `
1️⃣ 기본 설정 확인:
  • .env 파일 또는 환경변수에 INTERNAL_LLM_BASE_URL 설정
  • 예: INTERNAL_LLM_BASE_URL=http://your-server:8443/api/v1

`;
  }

  // 연결 오류 해결
  if (result.connectionStatus === 'failed') {
    guide += `
2️⃣ 연결 문제 해결:
  • 서버가 실행 중인지 확인: curl {baseUrl}/chat/completions
  • 방화벽 설정 확인
  • 네트워크 연결 상태 확인
  • 프록시 설정 확인

`;
  }

  // SSL 문제 해결
  if (result.errors.some(e => e.includes('HTTPS')) || result.warnings.some(w => w.includes('HTTP'))) {
    guide += `
3️⃣ SSL/TLS 설정:
  • 자체 서명 인증서 사용 시: NODE_TLS_REJECT_UNAUTHORIZED=0
  • 보안을 위해 가능하면 유효한 인증서 사용 권장

`;
  }

  guide += `
4️⃣ 추가 도움:
  • 테스트 서버 실행: npm run test:proxy
  • 상세 디버그 모드: DEBUG=1 qwen
  • 문서 확인: README.md의 내부망 LLM 설정 섹션

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return guide;
}

export const validateCommand = {
  name: 'validate',
  description: '내부망 LLM 설정을 검증합니다',
  action: async (context: CommandContext): Promise<{ type: 'message'; messageType: 'info' | 'error'; content: string } | undefined> => {
    const result = await handleValidateCommand(context);
    return {
      type: 'message',
      messageType: 'info',
      content: result,
    };
  },
};