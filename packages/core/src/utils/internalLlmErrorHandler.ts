/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InternalLlmErrorDetails {
  type: 'connection' | 'authentication' | 'server' | 'timeout' | 'configuration' | 'unknown';
  statusCode?: number;
  originalError: Error;
  timestamp: Date;
  url?: string;
  suggestion?: string;
}

export class InternalLlmError extends Error {
  public readonly details: InternalLlmErrorDetails;

  constructor(details: InternalLlmErrorDetails) {
    super(details.originalError.message);
    this.name = 'InternalLlmError';
    this.details = details;
  }

  public getUserFriendlyMessage(): string {
    switch (this.details.type) {
      case 'connection':
        return this.getConnectionErrorMessage();
      case 'authentication':
        return this.getAuthenticationErrorMessage();
      case 'server':
        return this.getServerErrorMessage();
      case 'timeout':
        return this.getTimeoutErrorMessage();
      case 'configuration':
        return this.getConfigurationErrorMessage();
      default:
        return this.getUnknownErrorMessage();
    }
  }

  public getDetailedDiagnostic(): string {
    return `
🚨 내부망 LLM 연결 오류 진단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 오류 유형: ${this.details.type}
🕒 발생 시간: ${this.details.timestamp.toISOString()}
${this.details.statusCode ? `📊 HTTP 상태코드: ${this.details.statusCode}` : ''}
${this.details.url ? `🌐 요청 URL: ${this.details.url}` : ''}

📋 원본 오류 메시지:
${this.details.originalError.message}

${this.getUserFriendlyMessage()}

${this.details.suggestion ? `💡 제안: ${this.details.suggestion}` : ''}

🔧 추가 진단을 위해 다음 명령어를 실행하세요:
  qwen /validate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  private getConnectionErrorMessage(): string {
    return `
🔴 서버 연결 실패

원인:
• 내부망 LLM 서버가 실행되지 않았을 수 있습니다
• 네트워크 연결에 문제가 있을 수 있습니다
• 방화벽이 연결을 차단하고 있을 수 있습니다

해결 방법:
1. 서버 상태 확인:
   curl ${process.env.INTERNAL_LLM_BASE_URL || 'http://localhost:8443'}/chat/completions

2. 테스트 서버 실행:
   npm run test:proxy

3. 네트워크 설정 확인:
   • 프록시 설정
   • VPN 연결 상태
   • 방화벽 규칙`;
  }

  private getAuthenticationErrorMessage(): string {
    return `
🔑 인증 실패

원인:
• API 키가 올바르지 않습니다
• 인증 방식이 서버와 맞지 않습니다

해결 방법:
1. API 키 확인:
   echo $INTERNAL_LLM_API_KEY

2. .env 파일 확인:
   INTERNAL_LLM_API_KEY=your-correct-api-key

3. 서버 인증 설정 확인`;
  }

  private getServerErrorMessage(): string {
    return `
🔧 서버 오류

원인:
• 내부망 LLM 서버에서 내부 오류가 발생했습니다
• 서버가 과부하 상태일 수 있습니다
• 모델 로딩에 실패했을 수 있습니다

해결 방법:
1. 서버 로그 확인
2. 잠시 후 다시 시도
3. 서버 관리자에게 문의`;
  }

  private getTimeoutErrorMessage(): string {
    return `
⏱️ 요청 시간 초과

원인:
• 네트워크 연결이 느립니다
• 서버 응답이 지연되고 있습니다

해결 방법:
1. 네트워크 연결 상태 확인
2. 잠시 후 다시 시도
3. 타임아웃 설정 조정 고려`;
  }

  private getConfigurationErrorMessage(): string {
    return `
⚙️ 설정 오류

원인:
• 필수 환경변수가 설정되지 않았습니다
• URL 형식이 올바르지 않습니다

해결 방법:
1. 필수 환경변수 확인:
   • INTERNAL_LLM_BASE_URL
   • INTERNAL_LLM_API_KEY
   • INTERNAL_LLM_MODEL

2. 설정 검증:
   qwen /validate

3. 설정 마법사 실행:
   npm run setup-internal`;
  }

  private getUnknownErrorMessage(): string {
    return `
❓ 알 수 없는 오류

원인을 파악하기 위해 다음을 시도해보세요:

1. 디버그 모드 실행:
   DEBUG=1 qwen

2. 설정 검증:
   qwen /validate

3. 로그 확인 및 개발팀 문의`;
  }
}

/**
 * Error 객체를 분석하여 InternalLlmError로 변환
 */
export function analyzeAndCreateInternalLlmError(
  error: Error,
  context?: { url?: string; statusCode?: number }
): InternalLlmError {
  const timestamp = new Date();
  let type: InternalLlmErrorDetails['type'] = 'unknown';
  let suggestion: string | undefined;

  // 에러 메시지 분석
  const message = error.message.toLowerCase();

  if (message.includes('econnrefused') || message.includes('connection refused')) {
    type = 'connection';
    suggestion = '서버가 실행 중인지 확인하고 "npm run test:proxy"로 테스트 서버를 시작해보세요.';
  } else if (message.includes('etimedout') || message.includes('timeout')) {
    type = 'timeout';
    suggestion = '네트워크 연결을 확인하고 잠시 후 다시 시도해보세요.';
  } else if (message.includes('enotfound') || message.includes('not found')) {
    type = 'connection';
    suggestion = 'INTERNAL_LLM_BASE_URL이 올바른지 확인해보세요.';
  } else if (message.includes('unauthorized') || message.includes('forbidden')) {
    type = 'authentication';
    suggestion = 'INTERNAL_LLM_API_KEY가 올바른지 확인해보세요.';
  } else if (context?.statusCode && context.statusCode >= 500) {
    type = 'server';
    suggestion = '서버에 일시적인 문제가 있을 수 있습니다. 잠시 후 다시 시도해보세요.';
  } else if (context?.statusCode && context.statusCode >= 400) {
    type = 'authentication';
    suggestion = '인증 정보나 요청 형식을 확인해보세요.';
  } else if (message.includes('json') || message.includes('parse')) {
    type = 'server';
    suggestion = '서버 응답 형식에 문제가 있습니다. 서버 설정을 확인해보세요.';
  }

  return new InternalLlmError({
    type,
    statusCode: context?.statusCode,
    originalError: error,
    timestamp,
    url: context?.url,
    suggestion,
  });
}

/**
 * 빠른 진단 실행
 */
export async function performQuickDiagnosis(): Promise<string> {
  const config = {
    baseUrl: process.env.INTERNAL_LLM_BASE_URL,
    apiKey: process.env.INTERNAL_LLM_API_KEY,
    model: process.env.INTERNAL_LLM_MODEL,
  };

  let report = `
🔍 내부망 LLM 빠른 진단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 설정 상태:`;

  // 설정 확인
  if (!config.baseUrl) {
    report += `\n❌ INTERNAL_LLM_BASE_URL: 설정되지 않음`;
  } else {
    report += `\n✅ INTERNAL_LLM_BASE_URL: ${config.baseUrl}`;
  }

  if (!config.apiKey) {
    report += `\n❌ INTERNAL_LLM_API_KEY: 설정되지 않음`;
  } else {
    report += `\n✅ INTERNAL_LLM_API_KEY: ***설정됨***`;
  }

  if (!config.model) {
    report += `\n❌ INTERNAL_LLM_MODEL: 설정되지 않음`;
  } else {
    report += `\n✅ INTERNAL_LLM_MODEL: ${config.model}`;
  }

  // 네트워크 기본 확인
  if (config.baseUrl) {
    try {
      const url = new URL(config.baseUrl);
      report += `\n\n🌐 네트워크 정보:`;
      report += `\n  호스트: ${url.hostname}`;
      report += `\n  포트: ${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
      report += `\n  프로토콜: ${url.protocol}`;
    } catch (e) {
      report += `\n\n❌ URL 형식 오류: ${config.baseUrl}`;
    }
  }

  report += `\n\n💡 자세한 진단을 위해 'qwen /validate' 명령어를 실행하세요.`;
  report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return report;
}