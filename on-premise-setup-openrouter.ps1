# OpenRouter API 설정 스크립트

Write-Host "🚀 OpenRouter API 설정 시작..." -ForegroundColor Green

# 환경변수 설정
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY = "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"
$env:OPENAI_MODEL = "qwen/qwen3-235b-a22b-2507"

Write-Host "✅ 환경변수 설정 완료" -ForegroundColor Green
Write-Host "📡 BASE_URL: $env:OPENAI_BASE_URL" -ForegroundColor Cyan
Write-Host "🔑 API_KEY: $($env:OPENAI_API_KEY.Substring(0,20))..." -ForegroundColor Cyan  
Write-Host "🤖 MODEL: $env:OPENAI_MODEL" -ForegroundColor Cyan

Write-Host "`n🧪 API 연결 테스트 중..." -ForegroundColor Yellow

# curl로 API 테스트
$testData = @{
    model = $env:OPENAI_MODEL
    messages = @(
        @{
            role = "user"
            content = "안녕하세요! 한국어로 간단히 응답해주세요."
        }
    )
    max_tokens = 100
}

$testPayload = $testData | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $env:OPENAI_API_KEY"
    "Content-Type" = "application/json"
}

try {
    Write-Host "API 요청 전송 중..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$env:OPENAI_BASE_URL/chat/completions" -Method Post -Body $testPayload -Headers $headers
    Write-Host "✅ API 연결 성공!" -ForegroundColor Green
    Write-Host "📝 응답: $($response.choices[0].message.content)" -ForegroundColor White
} catch {
    Write-Host "❌ API 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔧 qwen-code 테스트 준비..." -ForegroundColor Yellow
Write-Host "다음 명령어로 qwen-code를 테스트하세요:" -ForegroundColor Cyan
Write-Host "qwen `"안녕하세요! OpenRouter 연결 테스트입니다.`"" -ForegroundColor White