$ErrorActionPreference = "Stop"
$Base = if ($env:CAMPUSEATS_BASE_URL) { $env:CAMPUSEATS_BASE_URL } else { "http://127.0.0.1:8102" }
$Token = if ($env:CAMPUSEATS_TOKEN) { $env:CAMPUSEATS_TOKEN } else { "demo-token" }
$Headers = @("-H", "Authorization: Bearer $Token", "-H", "Accept: application/json")
$Transcript = Join-Path (Get-Location) "curl-transcript.txt"
"Assignment 5 curl -v transcript (generated against $Base)" | Set-Content $Transcript
"Start the Delivery API and mock Orders service before running this script." | Add-Content $Transcript
function Run-Curl([string]$Label, [string[]]$Args) {
  "`r`n===== $Label =====" | Add-Content $Transcript
  & curl.exe -v @Args 2>&1 | Out-String -Width 240 | Add-Content $Transcript
}
$Body = '{"orderId":"1042","deliveryAddress":"Village Rampur, India","packageDetails":"Farm produce"}'
$key = "assignment5-order-1042"
Run-Curl "Create delivery: expect 201 and Location" (@("-i", "$Base/deliveries", "-X", "POST") + $Headers + @("-H", "Content-Type: application/json", "-H", "Idempotency-Key: $key", "--data", $Body))
$createJson = & curl.exe -s "$Base/deliveries" -X POST @Headers -H "Content-Type: application/json" -H "Idempotency-Key: $key" --data $Body
$deliveryId = ($createJson | ConvertFrom-Json).deliveryId
if (-not $deliveryId) { throw "Create failed; check the transcript and Orders service." }
Run-Curl "Same create repeated with same Idempotency-Key" (@("-i", "$Base/deliveries", "-X", "POST") + $Headers + @("-H", "Content-Type: application/json", "-H", "Idempotency-Key: $key", "--data", $Body))
$getHeaders = & curl.exe -s -D - "$Base/deliveries/$deliveryId" @Headers -o NUL
$etagLine = $getHeaders | Where-Object { $_ -match "(?i)^etag:" } | Select-Object -Last 1
$etag = ($etagLine -replace "(?i)^etag:\s*", "").Trim()
if (-not $etag) { throw "GET did not return ETag." }
Run-Curl "Conditional GET: expect 304 and no body" (@("-i", "$Base/deliveries/$deliveryId") + $Headers + @("-H", "If-None-Match: $etag"))
Run-Curl "Stale conditional PUT: expect 412" (@("-i", "$Base/deliveries/$deliveryId", "-X", "PUT") + $Headers + @("-H", "Content-Type: application/json", "-H", 'If-Match: "stale-etag"', "--data", '{"deliveryAddress":"Stale editor"}'))
Run-Curl "Malformed JSON: expect 400" (@("-i", "$Base/deliveries", "-X", "POST") + $Headers + @("-H", "Content-Type: application/json", "-H", "Idempotency-Key: malformed", "--data", "{bad json"))
Run-Curl "Missing delivery: expect 404" (@("-i", "$Base/deliveries/not-a-real-id") + $Headers)
Run-Curl "Missing token: expect 401" (@("-i", "$Base/deliveries"))
Write-Host "Transcript saved to $Transcript"
