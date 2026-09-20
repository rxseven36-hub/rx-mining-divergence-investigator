param(
    [string]$Commodity = "Coal",
    [int]$Year = 2024
)

$ErrorActionPreference = "Stop"

if (-not $env:SECTORS_API_KEY) {
    throw "SECTORS_API_KEY is not configured."
}

$headers = @{
    Authorization = $env:SECTORS_API_KEY
}

$base = "https://api.sectors.app/v2/mining"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = ".\tmp\sectors-final-arsenal-$stamp"

New-Item -ItemType Directory -Force $out | Out-Null

$results = [System.Collections.Generic.List[object]]::new()

function Hunt {
    param(
        [string]$Name,
        [string]$Url,
        [string]$File
    )

    Write-Host ""
    Write-Host ">>> $Name" -ForegroundColor Cyan
    Write-Host "GET $Url" -ForegroundColor DarkGray

    $target = Join-Path $out $File
    $parent = Split-Path $target -Parent
    New-Item -ItemType Directory -Force $parent | Out-Null

    try {
        $r = Invoke-WebRequest `
            -Uri $Url `
            -Headers $headers `
            -Method GET `
            -UseBasicParsing

        [System.IO.File]::WriteAllText(
            (Join-Path (Get-Location) $target),
            $r.Content,
            (New-Object System.Text.UTF8Encoding($false))
        )

        $j = $r.Content | ConvertFrom-Json
        $count = 0

        if ($j -is [array]) {
            $count = @($j).Count
        }
        elseif ($null -ne $j.results) {
            $count = @($j.results).Count
        }
        elseif ($null -ne $j.data) {
            $count = @($j.data).Count
        }
        else {
            $count = $j.PSObject.Properties.Count
        }

        $results.Add([pscustomobject]@{
            Arsenal = $Name
            Status  = "SUCCESS"
            HTTP    = 200
            Count   = $count
            File    = $File
            Error   = $null
        })

        Write-Host "SUCCESS | count=$count" -ForegroundColor Green
    }
    catch {
        $http = $null

        try {
            $http = [int]$_.Exception.Response.StatusCode
        }
        catch {}

        $message = $_.Exception.Message

        $results.Add([pscustomobject]@{
            Arsenal = $Name
            Status  = "FAILED"
            HTTP    = $http
            Count   = 0
            File    = $File
            Error   = $message
        })

        Write-Host "FAILED | HTTP=$http" -ForegroundColor Red
        Write-Host $message -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host " RX MDI - SECTORS FINAL ARSENAL HUNT V2"
Write-Host " GOLDEN PATH: $Commodity / $Year"
Write-Host "==============================================" -ForegroundColor Yellow

# 1 â€” Commodity discovery
Hunt `
    "Commodity Discovery" `
    "$base/commodities/" `
    "commodities\index.json"

# 2 â€” Coal price
Hunt `
    "Commodity Price" `
    "$base/commodities/$Commodity/price/?start_year=2024&end_year=2026" `
    "commodity-price\$Commodity.json"

# 3 â€” Global commodity intelligence
Hunt `
    "Global Commodity" `
    "$base/global-commodity/?commodity_type=$Commodity&limit=100" `
    "global-commodity\$Commodity.json"

# 4 â€” Indonesian mining exports
Hunt `
    "Indonesia Mining Exports" `
    "$base/trade/exports/?commodity_type=$Commodity&year=$Year&limit=100" `
    "exports\$Commodity-$Year.json"

# 5 â€” National production
Hunt `
    "National Production" `
    "$base/production/total/?commodity_type=$Commodity" `
    "national-production\$Commodity.json"

# 6 â€” Province / commodity resources-reserves discovery
Hunt `
    "Provincial Resources Reserves" `
    "$base/resources-reserves/" `
    "province-reserves\index.json"

# 7 â€” License auction discovery
Hunt `
    "License Auctions" `
    "$base/license-auctions/?limit=100" `
    "license-auctions\index.json"

$summary = Join-Path $out "FINAL-ARSENAL-RESULT.json"

$results |
    ConvertTo-Json -Depth 20 |
    Set-Content $summary -Encoding UTF8

Write-Host ""
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host " FINAL ARSENAL HUNT RESULT"
Write-Host "==============================================" -ForegroundColor Yellow

$results |
    Select-Object Arsenal, Status, HTTP, Count |
    Format-Table -AutoSize

Write-Host ""
Write-Host "OUTPUT DIRECTORY:" -ForegroundColor Cyan
Write-Host $out -ForegroundColor Yellow

Write-Host ""
Write-Host "FAILED ENDPOINTS:" -ForegroundColor Cyan

$failed = @($results | Where-Object Status -eq "FAILED")

if ($failed.Count -eq 0) {
    Write-Host "NONE" -ForegroundColor Green
}
else {
    $failed |
        Select-Object Arsenal, HTTP, Error |
        Format-Table -Wrap -AutoSize
}

Write-Host ""
Write-Host "HUNT COMPLETE." -ForegroundColor Green