# OpenRouter API 간단 설정 스크립트

Write-Host "🚀 OpenRouter API 설정 시작..." -ForegroundColor Green

# 환경변수 설정
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY = "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"
$env:OPENAI_MODEL = "qwen/qwen3-235b-a22b-2507"

Write-Host "✅ 환경변수 설정 완료" -ForegroundColor Green
Write-Host "📡 BASE_URL: $env:OPENAI_BASE_URL" -ForegroundColor Cyan
Write-Host "🔑 API_KEY: sk-or-v1-fb0cfd8c..." -ForegroundColor Cyan  
Write-Host "🤖 MODEL: $env:OPENAI_MODEL" -ForegroundColor Cyan

Write-Host "`n🧪 curl로 API 연결 테스트 중..." -ForegroundColor Yellow

# curl 명령어로 간단 테스트
$curlCommand = 'curl -X POST "https://openrouter.ai/api/v1/chat/completions" -H "Authorization: Bearer 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" -H "Content-Type: application/json" -d "{\"model\":\"qwen/qwen3-235b-a22b-2507\",\"messages\":[{\"role\":\"user\",\"content\":\"안녕하세요! 간단히 응답해주세요.\"}],\"max_tokens\":50}"'

Write-Host "🌐 API 테스트 실행 중..." -ForegroundColor Yellow
Invoke-Expression $curlCommand

Write-Host "`n🔧 qwen-code 테스트 준비 완료" -ForegroundColor Green
Write-Host "다음 명령어로 qwen-code를 테스트하세요:" -ForegroundColor Cyan
Write-Host 'qwen "안녕하세요! OpenRouter 연결 테스트입니다."' -ForegroundColor White