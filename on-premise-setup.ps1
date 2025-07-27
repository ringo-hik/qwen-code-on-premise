<#
===============================================================================
    on-premise-setup-openrouter.ps1
    OpenRouter API 환경 변수 설정 + 연결 테스트 (curl / Invoke‑RestMethod)
    작성자: NYF
===============================================================================
#>

Write-Host "🚀 OpenRouter API 설정 시작..." -ForegroundColor Green

# ───────────────────────────────────────
# 1) 환경 변수
# ───────────────────────────────────────
$env:OPENAI_BASE_URL = "https://openrouter.ai/api/v1"
$env:OPENAI_API_KEY  = "sk-or-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"  # ← 여기 교체
$env:OPENAI_MODEL    = "qwen/qwen3-235b-a22b-2507"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$env:INTERNAL_WEB_CONFIG_PATH = "./internal-web-config.json"

Write-Host "✅ 환경변수 설정 완료" -ForegroundColor Green
Write-Host ("📡 BASE_URL: {0}" -f $env:OPENAI_BASE_URL) -ForegroundColor Cyan
Write-Host ("🔑 API_KEY : {0}..." -f $env:OPENAI_API_KEY.Substring(0,16)) -ForegroundColor Cyan
Write-Host ("🤖 MODEL   : {0}" -f $env:OPENAI_MODEL) -ForegroundColor Cyan

# ───────────────────────────────────────
# 2) JSON 바디 생성
# ───────────────────────────────────────
$body = @{
    model      = $env:OPENAI_MODEL
    messages   = @(@{ role = "user"; content = "안녕하세요! 간단히 응답해주세요." })
    max_tokens = 50
} | ConvertTo-Json -Depth 5 -Compress

# ───────────────────────────────────────
# 3‑A) curl 테스트 (백틱으로 한 줄)
# ───────────────────────────────────────
Write-Host "`n🧪 curl 로 API 연결 테스트..." -ForegroundColor Yellow

$curlCmd = "curl --silent -X POST `"$($env:OPENAI_BASE_URL)/chat/completions`" " `
          + "-H `"Authorization: Bearer $($env:OPENAI_API_KEY)`" " `
          + "-H `"Content-Type: application/json; charset=utf-8`" " `
          + "-d `'$body`'"

Write-Host "🌐 실행 명령:" -ForegroundColor Yellow
Write-Host $curlCmd -ForegroundColor DarkGray
Invoke-Expression $curlCmd  # 결과 바로 출력

# ───────────────────────────────────────
# 3‑B) PowerShell 네이티브 테스트
# ───────────────────────────────────────
Write-Host "`n⚡ Invoke‑RestMethod 로 API 연결 테스트..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod `
        -Uri "$($env:OPENAI_BASE_URL)/chat/completions" `
        -Method POST `
        -Headers @{ Authorization = "Bearer $($env:OPENAI_API_KEY)" } `
        -ContentType "application/json; charset=utf-8" `
        -Body $body `
        -TimeoutSec 60

    Write-Host "`n💬 모델 응답:" -ForegroundColor Green
    $response.choices[0].message.content
}
catch {
    Write-Warning "API 호출 실패: $($_.Exception.Message)"
}

# ───────────────────────────────────────
# 4) qwen-code CLI 테스트 안내
# ───────────────────────────────────────
Write-Host "`n🔧 qwen-code 테스트 준비 완료" -ForegroundColor Green
Write-Host 'qwen "안녕하세요! OpenRouter 연결 테스트입니다."' -ForegroundColor White
