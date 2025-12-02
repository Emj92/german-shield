# Telemetry Test Script
$portalUrl = "http://localhost:3000"
$endpoint = "$portalUrl/api/telemetry"

$sha256 = [System.Security.Cryptography.SHA256]::Create()
$ipHash = [System.BitConverter]::ToString($sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("127.0.0.1"))).Replace("-", "").ToLower()
$emailHash = [System.BitConverter]::ToString($sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("test.com"))).Replace("-", "").ToLower()
$uaHash = [System.BitConverter]::ToString($sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("Test UA"))).Replace("-", "").ToLower()

$body = @{
    ip_hash = $ipHash
    country_code = "DE"
    block_method = "test"
    block_reason = "PowerShell Test"
    email_domain_hash = $emailHash
    user_agent_hash = $uaHash
} | ConvertTo-Json

Write-Host "Sende Test-Event an: $endpoint" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -ContentType "application/json"
    Write-Host "ERFOLG! Event ID: $($response.id)" -ForegroundColor Green
}
catch {
    Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Ist der Server gestartet? (npm run dev im app/ Ordner)" -ForegroundColor Yellow
}

