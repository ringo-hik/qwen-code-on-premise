# qwen-code OpenRouter Simple Test

Write-Host "Starting qwen-code OpenRouter test..." -ForegroundColor Green

# Set environment variables
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY = "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"
$env:OPENAI_MODEL = "qwen/qwen3-235b-a22b-2507"

Write-Host "Environment variables set successfully" -ForegroundColor Green
Write-Host "BASE_URL: $env:OPENAI_BASE_URL" -ForegroundColor Cyan
Write-Host "MODEL: $env:OPENAI_MODEL" -ForegroundColor Cyan

Write-Host ""
Write-Host "Running qwen-code test..." -ForegroundColor Yellow

# Test qwen command
Write-Host "Test 1: Simple greeting" -ForegroundColor Cyan
& qwen "Hello! Please respond in Korean."

Write-Host ""
Write-Host "Test 2: Code generation" -ForegroundColor Cyan  
& qwen "Write a Python hello world code."

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green