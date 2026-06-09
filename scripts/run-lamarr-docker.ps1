# Chạy sensing-server Docker với UI LAMARR local (KHÔNG dùng UI RuView trong image)
$repoRoot = Split-Path $PSScriptRoot -Parent
$uiPath = (Resolve-Path (Join-Path $repoRoot "ui")).Path
$url = "http://localhost:3000/ui/index.html"

Write-Host ""
Write-Host "=== LAMARR Docker ===" -ForegroundColor Magenta
Write-Host "UI local:  $uiPath" -ForegroundColor Cyan
Write-Host "Mo trinh duyet: $url" -ForegroundColor Green
Write-Host "NEU van thay RuView: Ctrl+Shift+R (xoa cache)" -ForegroundColor Yellow
Write-Host ""

# Dung container cu neu dang chay cung image/port
docker ps -q --filter "ancestor=ruvnet/wifi-densepose:latest" | ForEach-Object { docker stop $_ 2>$null }

Start-Process $url

docker run --rm `
  -v "${uiPath}:/app/ui:ro" `
  -e CSI_SOURCE=esp32 `
  -e RUVIEW_ALLOW_UNAUTHENTICATED=1 `
  -p 3000:3000 `
  -p 3001:3001 `
  -p 5005:5005/udp `
  ruvnet/wifi-densepose:latest
