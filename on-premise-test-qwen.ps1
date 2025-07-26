# qwen-code OpenRouter 테스트 스크립트

Write-Host "🚀 qwen-code OpenRouter 테스트 시작" -ForegroundColor Green

# 환경변수 설정
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY = "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"
$env:OPENAI_MODEL = "qwen/qwen3-235b-a22b-2507"

Write-Host "✅ 환경변수 설정 완료" -ForegroundColor Green
Write-Host "📡 BASE_URL: $env:OPENAI_BASE_URL" -ForegroundColor Cyan
Write-Host "🤖 MODEL: $env:OPENAI_MODEL" -ForegroundColor Cyan

Write-Host "`n🧪 qwen-code 테스트 실행..." -ForegroundColor Yellow

# qwen 명령어 테스트 (따옴표 주의)
Write-Host "테스트 1: 간단한 인사" -ForegroundColor Cyan
& qwen "Hello! Please respond in Korean."

Write-Host "`n테스트 2: 코드 생성 요청" -ForegroundColor Cyan  
& qwen "Python으로 Hello World를 출력하는 코드를 작성해주세요."

Write-Host "`n테스트 3: 한국어 대화" -ForegroundColor Cyan
& qwen "안녕하세요! 정상적으로 작동하고 있나요?"

Write-Host ""
Write-Host "🎉 테스트 완료!" -ForegroundColor Green