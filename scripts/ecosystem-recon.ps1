param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("ADMR", "BUMI", "BYAN", "ITMG", "GEMS")]
    [string]$Ticker
)

$ErrorActionPreference = "Stop"

Set-Location "C:\PROJECTS\RX MINING DIVERGENCE INVESTIGATOR"

Write-Host ""
Write-Host "=============================================="
Write-Host " RX MDI MINING ECOSYSTEM RECON"
Write-Host " TARGET: $Ticker"
Write-Host "=============================================="

if (-not $env:SECTORS_API_KEY) {
    throw "SECTORS_API_KEY is not configured."
}

$headers = @{
    Authorization = $env:SECTORS_API_KEY
}

$tickerLower = $Ticker.ToLower()

$ownershipPath = ".\tmp\live-coverage-20260911\ownership\$Ticker.json"

if (-not (Test-Path $ownershipPath)) {
    throw "Ownership file not found: $ownershipPath"
}

$outRoot = ".\tmp\visual-arsenal-20260912\$tickerLower"

$siteListDir   = Join-Path $outRoot "sites"
$siteDetailDir = Join-Path $outRoot "site-details"
$licenseDir    = Join-Path $outRoot "licenses"
$manifestDir   = Join-Path $outRoot "manifest"

@(
    $siteListDir,
    $siteDetailDir,
    $licenseDir,
    $manifestDir
) | ForEach-Object {
    New-Item -ItemType Directory -Force -Path $_ | Out-Null
}

$ownership = Get-Content $ownershipPath -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "OWNERSHIP FILE : $ownershipPath"
Write-Host "COMPANY SLUG   : $($ownership.slug)"
Write-Host "SUBSIDIARIES   : $(@($ownership.subsidiaries).Count)"

$operatorRecon = @()
$allSites = @()
$allLicenses = @()

foreach ($sub in @($ownership.subsidiaries)) {

    Write-Host ""
    Write-Host "----------------------------------------------"
    Write-Host "SUBSIDIARY :" $sub.name
    Write-Host "SLUG       :" $sub.slug
    Write-Host "OWNERSHIP  :" $sub.percentage_ownership

    if (-not $sub.slug) {

        Write-Host "SKIP       : no slug"

        $operatorRecon += [PSCustomObject]@{
            name       = $sub.name
            slug       = $null
            ownership  = $sub.percentage_ownership
            sites      = 0
            licenses   = 0
            operator   = $false
            status     = "NO_SLUG"
        }

        continue
    }

    # ==========================================
    # SITE DISCOVERY
    # ==========================================

    $siteCount = 0
    $siteStatus = "SUCCESS"

    try {

        $siteUrl =
            "https://api.sectors.app/v2/mining/sites/?company=$($sub.slug)&limit=100"

        $siteResponse = Invoke-WebRequest `
            -Uri $siteUrl `
            -Headers $headers `
            -Method GET `
            -UseBasicParsing

        $siteJson = $siteResponse.Content | ConvertFrom-Json

        $siteFile = Join-Path $siteListDir ($sub.slug + ".json")

        $siteResponse.Content |
            Set-Content `
                -Path $siteFile `
                -Encoding UTF8

        $siteCount = [int]$siteJson.pagination.total_count

        Write-Host "SITES      :" $siteCount

        foreach ($site in @($siteJson.results)) {

            Write-Host "  SITE     :" $site.name
            Write-Host "  SLUG     :" $site.slug

            if (-not $site.slug) {
                continue
            }

            # ==================================
            # SITE DETAIL
            # ==================================

            try {

                $detailUrl =
                    "https://api.sectors.app/v2/mining/sites/$($site.slug)/"

                $detailResponse = Invoke-WebRequest `
                    -Uri $detailUrl `
                    -Headers $headers `
                    -Method GET `
                    -UseBasicParsing

                $detailJson =
                    $detailResponse.Content |
                    ConvertFrom-Json

                $detailFile =
                    Join-Path $siteDetailDir ($site.slug + ".json")

                $detailResponse.Content |
                    Set-Content `
                        -Path $detailFile `
                        -Encoding UTF8

                $allSites += [PSCustomObject]@{
                    name                       = $detailJson.name
                    slug                       = $detailJson.slug

                    company_name               = $detailJson.company_name
                    company_slug               = $detailJson.company_slug

                    commodity_type             = $detailJson.commodity_type
                    year                       = $detailJson.year

                    production_volume          = $detailJson.production_volume
                    unit                       = $detailJson.unit

                    overburden_removal_volume  =
                        $detailJson.overburden_removal_volume

                    strip_ratio                = $detailJson.strip_ratio

                    province                   =
                        $detailJson.location.province

                    city                       =
                        $detailJson.location.city

                    latitude                   =
                        $detailJson.location.latitude

                    longitude                  =
                        $detailJson.location.longitude

                    resources_reserves         =
                        $detailJson.resources_reserves
                }
            }
            catch {

                Write-Host "  DETAIL FAILED :" $site.slug
            }
        }
    }
    catch {

        $siteStatus = "FAILED"

        Write-Host "SITES FAILED"
    }

    # ==========================================
    # LICENSE DISCOVERY
    # ==========================================

    $licenseCount = 0
    $licenseStatus = "SUCCESS"

    try {

        $licenseUrl =
            "https://api.sectors.app/v2/mining/licenses/?company=$($sub.slug)&limit=100"

        $licenseResponse = Invoke-WebRequest `
            -Uri $licenseUrl `
            -Headers $headers `
            -Method GET `
            -UseBasicParsing

        $licenseJson =
            $licenseResponse.Content |
            ConvertFrom-Json

        $licenseFile =
            Join-Path $licenseDir ($sub.slug + ".json")

        $licenseResponse.Content |
            Set-Content `
                -Path $licenseFile `
                -Encoding UTF8

        $licenseCount =
            [int]$licenseJson.pagination.total_count

        Write-Host "LICENSES   :" $licenseCount

        foreach ($license in @($licenseJson.results)) {

            $allLicenses += [PSCustomObject]@{
                company_name       = $license.company_name
                company_slug       = $license.company_slug

                wiup_code          = $license.wiup_code
                license_number     = $license.license_number
                license_type       = $license.license_type

                activity           = $license.activity
                commodity_type     = $license.commodity_type

                province           = $license.province
                city               = $license.city

                licensed_area_ha   = $license.licensed_area_ha

                effective_date     =
                    $license.license_effective_date

                expiry_date        =
                    $license.license_expiry_date

                cnc                = $license.cnc
            }
        }
    }
    catch {

        $licenseStatus = "FAILED"

        Write-Host "LICENSE FAILED"
    }

    # ==========================================
    # OPERATOR CLASSIFICATION
    # ==========================================

    $isOperator =
        ($siteCount -gt 0) -or
        ($licenseCount -gt 0)

    $status = "NON_MINING_SUBSIDIARY"

    if ($isOperator) {
        $status = "MINING_OPERATOR"
    }

    if (
        $siteStatus -eq "FAILED" -or
        $licenseStatus -eq "FAILED"
    ) {
        $status = "RECON_INCOMPLETE"
    }

    $operatorRecon += [PSCustomObject]@{
        name       = $sub.name
        slug       = $sub.slug
        ownership  = $sub.percentage_ownership
        sites      = $siteCount
        licenses   = $licenseCount
        operator   = $isOperator
        status     = $status
    }
}

# ==============================================
# BUILD MANIFEST
# ==============================================

$manifest = [PSCustomObject]@{

    generated_at =
        (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")

    ticker = $Ticker

    company_slug =
        $ownership.slug

    parents =
        @($ownership.parents)

    subsidiaries =
        @($ownership.subsidiaries)

    operator_recon =
        @($operatorRecon)

    mining_summary = [PSCustomObject]@{

        subsidiary_count =
            @($ownership.subsidiaries).Count

        confirmed_operator_count =
            @(
                $operatorRecon |
                Where-Object {
                    $_.operator -eq $true
                }
            ).Count

        site_count =
            @($allSites).Count

        license_count =
            @($allLicenses).Count

        mapped_site_count =
            @(
                $allSites |
                Where-Object {
                    $null -ne $_.latitude -and
                    $null -ne $_.longitude
                }
            ).Count
    }

    sites =
        @($allSites)

    licenses =
        @($allLicenses)
}

$manifestPath =
    Join-Path `
        $manifestDir `
        "$Ticker-mining-ecosystem.json"

$manifest |
    ConvertTo-Json -Depth 25 |
    Set-Content `
        -Path $manifestPath `
        -Encoding UTF8

# ==============================================
# SUMMARY
# ==============================================

Write-Host ""
Write-Host "=============================================="
Write-Host " RX MDI ECOSYSTEM RECON SUMMARY"
Write-Host "=============================================="

$operatorRecon |
    Format-Table `
        name,
        sites,
        licenses,
        operator,
        status `
        -AutoSize

Write-Host ""
Write-Host "SUBSIDIARIES :" `
    $manifest.mining_summary.subsidiary_count

Write-Host "OPERATORS    :" `
    $manifest.mining_summary.confirmed_operator_count

Write-Host "SITES        :" `
    $manifest.mining_summary.site_count

Write-Host "LICENSES     :" `
    $manifest.mining_summary.license_count

Write-Host "MAPPED SITES :" `
    $manifest.mining_summary.mapped_site_count

Write-Host ""
Write-Host "MANIFEST     :" $manifestPath

Write-Host ""
Write-Host "=== RECON COMPLETE ==="