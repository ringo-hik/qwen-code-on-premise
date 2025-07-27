# PowerShell Environment Setup Script for Qwen Code On-Premise
# This script helps convert PowerShell environment variable syntax to .env file format

param(
    [string]$EnvFile = ".env",
    [switch]$Interactive
)

Write-Host "Qwen Code On-Premise Environment Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

if ($Interactive) {
    Write-Host "`nInteractive Setup Mode" -ForegroundColor Yellow
    
    $baseUrl = Read-Host "Enter your internal LLM server URL (e.g., http://your-server:8080/v1)"
    $apiKey = Read-Host "Enter your API key"
    $model = Read-Host "Enter your model name (e.g., qwen3-235b-a22b-2507)"
    $sslBypass = Read-Host "Bypass SSL verification? (y/n)" 
    
    $envContent = @"
# Qwen Code On-Premise Configuration
OPENAI_BASE_URL=$baseUrl
OPENAI_API_KEY=$apiKey
OPENAI_MODEL=$model
ON_PREMISE_MODE=true
"@

    if ($sslBypass -eq "y" -or $sslBypass -eq "Y") {
        $envContent += "`nNODE_TLS_REJECT_UNAUTHORIZED=0"
    }
    
    $envContent | Out-File -FilePath $EnvFile -Encoding UTF8
    Write-Host "`n✅ .env file created successfully!" -ForegroundColor Green
} else {
    Write-Host "`nQuick Setup Commands:" -ForegroundColor Yellow
    Write-Host "1. Copy example file:"
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor Cyan
    Write-Host "`n2. Edit .env file with your settings"
    Write-Host "`n3. Or use interactive mode:"
    Write-Host "   .\scripts\env-setup.ps1 -Interactive" -ForegroundColor Cyan
}

Write-Host "`nExample .env file format:" -ForegroundColor Yellow
Write-Host @"
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=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
OPENAI_MODEL=qwen/qwen3-235b-a22b-2507
NODE_TLS_REJECT_UNAUTHORIZED=0
INTERNAL_WEB_CONFIG_PATH=./internal-web-config.json
"@ -ForegroundColor Gray

Write-Host "`nAfter creating .env file, simply run: qwen-one" -ForegroundColor Green