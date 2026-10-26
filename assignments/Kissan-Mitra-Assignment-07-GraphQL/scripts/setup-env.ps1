$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"
$secure = Read-Host "Enter MySQL root password (input hidden)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  # dotenv double-quoted values support escaped backslashes, quotes and newlines.
  $escaped = $password.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n')
  $lines = @(
    "DB_HOST=127.0.0.1",
    "DB_PORT=3306",
    "DB_USER=root",
    ('DB_PASSWORD="' + $escaped + '"'),
    "DB_NAME=kissan_mitra_graphql",
    "PORT=4000"
  )
  Set-Content -Path $envPath -Value $lines -Encoding ascii
  Write-Host ".env created in the Assignment 07 folder. Password was not displayed."
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  $password = $null
  $escaped = $null
  $secure = $null
}
