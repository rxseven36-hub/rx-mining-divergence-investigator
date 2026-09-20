Set-Location "C:\PROJECTS\RX MINING DIVERGENCE INVESTIGATOR"

$lab = ".\src\components\rxmdi\company-lab"
$generated = Join-Path $lab "generated"

New-Item -ItemType Directory $generated -Force | Out-Null

Write-Host ""
Write-Host "===================================================="
Write-Host " RX MDI - COMPANY INTELLIGENCE BUILD #3"
Write-Host " COAL PRODUCTS + SALES GEOGRAPHY"
Write-Host " LOCAL DATA ONLY"
Write-Host "===================================================="

# ====================================================
# 1. GENERATE COAL PRODUCT DATA
# ====================================================

Write-Host ""
Write-Host "=== COAL PRODUCTS ==="

$performancePath = ".\tmp\live-coverage-20260911\performance-2024\BUMI-2024.json"

if (-not (Test-Path $performancePath)) {
    throw "Performance file not found: $performancePath"
}

$performance = Get-Content $performancePath -Raw | ConvertFrom-Json
$products = @($performance.data.commodity_stats.products)

$productRows = foreach ($product in $products) {

    [PSCustomObject]@{
        name = $product.product_name

        calorificMin = if ($product.calorific_value_kcal) {
            $product.calorific_value_kcal.min
        } else {
            $null
        }

        calorificMax = if ($product.calorific_value_kcal) {
            $product.calorific_value_kcal.max
        } else {
            $null
        }

        moistureMin = if ($product.total_moisture_pct) {
            $product.total_moisture_pct.min
        } else {
            $null
        }

        moistureMax = if ($product.total_moisture_pct) {
            $product.total_moisture_pct.max
        } else {
            $null
        }

        ashMin = if ($product.ash_content_adb) {
            $product.ash_content_adb.min
        } else {
            $null
        }

        ashMax = if ($product.ash_content_adb) {
            $product.ash_content_adb.max
        } else {
            $null
        }

        sulphurMin = if ($product.total_sulphur_adb) {
            $product.total_sulphur_adb.min
        } else {
            $null
        }

        sulphurMax = if ($product.total_sulphur_adb) {
            $product.total_sulphur_adb.max
        } else {
            $null
        }
    }
}

$productRows = $productRows |
    Sort-Object {
        if ($null -ne $_.calorificMax) {
            [double]$_.calorificMax
        } else {
            0
        }
    } -Descending

$productRows |
    ConvertTo-Json -Depth 10 |
    Set-Content `
        (Join-Path $generated "bumi-products.json") `
        -Encoding UTF8

Write-Host "Products generated : $(@($productRows).Count)"

$productRows |
    Select-Object name, calorificMax, moistureMax, ashMax, sulphurMax |
    Format-Table -AutoSize


# ====================================================
# 2. GENERATE SALES DESTINATION DATA
# ====================================================

Write-Host ""
Write-Host "=== SALES DESTINATIONS ==="

$salesPath = ".\tmp\live-coverage-20260911\sales-destination-2024\BUMI-2024.json"

if (-not (Test-Path $salesPath)) {
    throw "Sales destination file not found: $salesPath"
}

$sales = Get-Content $salesPath -Raw | ConvertFrom-Json

$salesRows = foreach ($property in $sales.data.PSObject.Properties) {

    $country = $property.Name
    $value = $property.Value

    if ($null -ne $value.volume) {

        [PSCustomObject]@{
            country = $country
            volume = [double]$value.volume
            unit = $value.unit
            commodity = $value.commodity_type
        }
    }
}

$salesRows = $salesRows |
    Sort-Object volume -Descending

$salesRows |
    ConvertTo-Json -Depth 10 |
    Set-Content `
        (Join-Path $generated "bumi-sales-destinations.json") `
        -Encoding UTF8

$totalVolume = (
    $salesRows |
    Measure-Object -Property volume -Sum
).Sum

Write-Host "Countries generated : $(@($salesRows).Count)"
Write-Host "Total sales volume  : $([math]::Round($totalVolume, 3)) Mt"

$salesRows |
    Select-Object country, volume, unit |
    Format-Table -AutoSize


# ====================================================
# 3. TYPES
# ====================================================

$typesPath = Join-Path $lab "company-lab.types.ts"

$types = Get-Content $typesPath -Raw

if ($types -notmatch "BumiCoalProduct") {

    Add-Content $typesPath @'

export type BumiCoalProduct = {
  name: string;
  calorificMin: number | null;
  calorificMax: number | null;
  moistureMin: number | null;
  moistureMax: number | null;
  ashMin: number | null;
  ashMax: number | null;
  sulphurMin: number | null;
  sulphurMax: number | null;
};

export type BumiSalesDestination = {
  country: string;
  volume: number;
  unit: string;
  commodity: string;
};
'@
}


# ====================================================
# 4. COAL PRODUCTS COMPONENT
# ====================================================

@'
import type { BumiCoalProduct } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  products: BumiCoalProduct[];
};

function format(value: number | null, suffix = "") {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}${suffix}`;
}

export default function CoalProducts({ products }: Props) {
  const usable = products.filter(
    (product) => product.calorificMax !== null,
  );

  const maxCalorific = Math.max(
    ...usable.map((product) => product.calorificMax ?? 0),
    1,
  );

  const highest = usable[0] ?? null;
  const lowest = usable[usable.length - 1] ?? null;

  return (
    <section className={styles.productSection}>
      <div className={styles.productHeader}>
        <div>
          <span>COAL PRODUCTS</span>
          <h2>What kind of coal does BUMI sell?</h2>
          <p>
            Compare product quality through calorific value,
            moisture, ash and sulphur.
          </p>
        </div>

        <div className={styles.productHeadline}>
          <span>{products.length}</span>
          <small>PRODUCT GRADES</small>
        </div>
      </div>

      {highest && lowest && (
        <div className={styles.productInsight}>
          <div>
            <span>HIGHEST CALORIFIC VALUE</span>
            <strong>{highest.name}</strong>
            <small>
              {format(highest.calorificMax, " kcal/kg")}
            </small>
          </div>

          <div>
            <span>LOWEST CALORIFIC VALUE</span>
            <strong>{lowest.name}</strong>
            <small>
              {format(lowest.calorificMax, " kcal/kg")}
            </small>
          </div>
        </div>
      )}

      <div className={styles.productList}>
        {products.map((product) => {
          const width =
            product.calorificMax === null
              ? 0
              : (product.calorificMax / maxCalorific) * 100;

          return (
            <article
              key={product.name}
              className={styles.productRow}
            >
              <div className={styles.productName}>
                <strong>{product.name}</strong>
                <span>Thermal Coal</span>
              </div>

              <div className={styles.productCalorific}>
                <div className={styles.productCalorificMeta}>
                  <span>CALORIFIC VALUE</span>
                  <strong>
                    {format(
                      product.calorificMax,
                      " kcal/kg",
                    )}
                  </strong>
                </div>

                <div className={styles.productTrack}>
                  <div
                    className={styles.productFill}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>

              <div className={styles.productQuality}>
                <span>MOISTURE</span>
                <strong>
                  {format(product.moistureMax, "%")}
                </strong>
              </div>

              <div className={styles.productQuality}>
                <span>ASH</span>
                <strong>
                  {format(product.ashMax, "%")}
                </strong>
              </div>

              <div className={styles.productQuality}>
                <span>SULPHUR</span>
                <strong>
                  {format(product.sulphurMax, "%")}
                </strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.productNote}>
        Quality values are shown only where they are reported in
        the verified product dataset. Missing attributes are not
        estimated.
      </div>
    </section>
  );
}
'@ | Set-Content `
    (Join-Path $lab "CoalProducts.tsx") `
    -Encoding UTF8


# ====================================================
# 5. SALES GEOGRAPHY COMPONENT
# ====================================================

@'
import type { BumiSalesDestination } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  destinations: BumiSalesDestination[];
};

function format(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SalesGeography({
  destinations,
}: Props) {
  const total = destinations.reduce(
    (sum, item) => sum + item.volume,
    0,
  );

  const domestic =
    destinations.find(
      (item) => item.country === "Indonesia",
    )?.volume ?? 0;

  const exportVolume = total - domestic;

  const exportShare =
    total > 0 ? (exportVolume / total) * 100 : 0;

  const maxVolume = Math.max(
    ...destinations.map((item) => item.volume),
    1,
  );

  const topExport =
    destinations.find(
      (item) => item.country !== "Indonesia",
    ) ?? null;

  return (
    <section className={styles.salesSection}>
      <div className={styles.salesHeader}>
        <div>
          <span>SALES GEOGRAPHY</span>
          <h2>Where does BUMI&apos;s coal go?</h2>
          <p>
            Reported 2024 sales volumes show both domestic demand
            and the company&apos;s major international markets.
          </p>
        </div>

        <div className={styles.salesTotal}>
          <span>TOTAL DESTINATION VOLUME</span>
          <strong>{format(total)} Mt</strong>
          <small>2024 reported destinations</small>
        </div>
      </div>

      <div className={styles.salesHighlights}>
        <div>
          <span>DOMESTIC</span>
          <strong>{format(domestic)} Mt</strong>
          <small>Indonesia</small>
        </div>

        <div>
          <span>EXPORT</span>
          <strong>{format(exportVolume)} Mt</strong>
          <small>{format(exportShare)}% of destination volume</small>
        </div>

        {topExport && (
          <div>
            <span>LARGEST EXPORT MARKET</span>
            <strong>{topExport.country}</strong>
            <small>{format(topExport.volume)} Mt</small>
          </div>
        )}
      </div>

      <div className={styles.salesRanking}>
        {destinations.map((destination, index) => {
          const width =
            (destination.volume / maxVolume) * 100;

          const share =
            total > 0
              ? (destination.volume / total) * 100
              : 0;

          return (
            <article
              key={destination.country}
              className={styles.salesRow}
            >
              <span className={styles.salesRank}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className={styles.salesCountry}>
                <strong>{destination.country}</strong>
                <small>
                  {destination.country === "Indonesia"
                    ? "Domestic market"
                    : "Export market"}
                </small>
              </div>

              <div className={styles.salesBarArea}>
                <div className={styles.salesBarMeta}>
                  <span>{format(share)}%</span>
                  <strong>
                    {format(destination.volume)} Mt
                  </strong>
                </div>

                <div className={styles.salesTrack}>
                  <div
                    className={styles.salesFill}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.salesRead}>
        <span>RX MDI READ</span>

        <p>
          Indonesia is the largest single destination in the
          reported dataset, while China and India form the two
          largest export markets.
        </p>
      </div>
    </section>
  );
}
'@ | Set-Content `
    (Join-Path $lab "SalesGeography.tsx") `
    -Encoding UTF8


# ====================================================
# 6. PATCH MAIN COMPANY LAB
# ====================================================

$mainPath = Join-Path $lab "BumiCompanyLab.tsx"
$main = Get-Content $mainPath -Raw

if ($main -notmatch 'CoalProducts from "./CoalProducts"') {

    $main = $main.Replace(
        'import MineOperations from "./MineOperations";',
        @'
import MineOperations from "./MineOperations";
import CoalProducts from "./CoalProducts";
import SalesGeography from "./SalesGeography";

import productsJson from "./generated/bumi-products.json";
import salesDestinationsJson from "./generated/bumi-sales-destinations.json";
'@
    )
}

if ($main -notmatch "BumiCoalProduct") {

    $main = $main.Replace(
        'BumiMineSite,',
        @'
BumiMineSite,
  BumiCoalProduct,
  BumiSalesDestination,
'@
    )
}

if ($main -notmatch "const products =") {

    $needle = 'const sites =
    sitesJson as BumiMineSite[];'

    $replacement = @'
const sites: BumiMineSite[] = Array.isArray(sitesJson)
    ? (sitesJson as BumiMineSite[])
    : [sitesJson as BumiMineSite];

  const products: BumiCoalProduct[] =
    Array.isArray(productsJson)
      ? (productsJson as BumiCoalProduct[])
      : [productsJson as BumiCoalProduct];

  const salesDestinations: BumiSalesDestination[] =
    Array.isArray(salesDestinationsJson)
      ? (salesDestinationsJson as BumiSalesDestination[])
      : [salesDestinationsJson as BumiSalesDestination];
'@

    if ($main.Contains($needle)) {
        $main = $main.Replace($needle, $replacement)
    }
    else {
        $needle2 = 'const sites: BumiMineSite[] = Array.isArray(sitesJson)
  ? (sitesJson as BumiMineSite[])
  : [sitesJson as BumiMineSite];'

        if ($main.Contains($needle2)) {
            $main = $main.Replace(
                $needle2,
                @'
const sites: BumiMineSite[] = Array.isArray(sitesJson)
    ? (sitesJson as BumiMineSite[])
    : [sitesJson as BumiMineSite];

  const products: BumiCoalProduct[] =
    Array.isArray(productsJson)
      ? (productsJson as BumiCoalProduct[])
      : [productsJson as BumiCoalProduct];

  const salesDestinations: BumiSalesDestination[] =
    Array.isArray(salesDestinationsJson)
      ? (salesDestinationsJson as BumiSalesDestination[])
      : [salesDestinationsJson as BumiSalesDestination];
'@
            )
        }
    }
}

if ($main -notmatch "<CoalProducts") {

    $main = $main.Replace(
        '      <MineOperations sites={sites} />',
        @'
      <MineOperations sites={sites} />

      <CoalProducts products={products} />

      <SalesGeography destinations={salesDestinations} />
'@
    )
}

$main = $main.Replace(
    '          <strong>Coal Products</strong>',
    ''
)

$main = $main.Replace(
    '          <strong>Sales Geography</strong>',
    ''
)

Set-Content $mainPath $main -Encoding UTF8


# ====================================================
# 7. CSS
# ====================================================

$cssPath = Join-Path $lab "CompanyLab.module.css"
$css = Get-Content $cssPath -Raw

if ($css -notmatch "BUILD #3") {

Add-Content $cssPath @'

/* ==================================================
   BUILD #3 — COAL PRODUCTS
   ================================================== */

.productSection,
.salesSection {
  width: min(1480px, 100%);
  margin: 14px auto 0;
  padding: 28px;
  border: 1px solid rgba(135, 175, 195, 0.12);
  border-radius: 22px;
  background: rgba(10, 23, 33, 0.72);
}

.productHeader,
.salesHeader {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  align-items: end;
}

.productHeader > div:first-child > span,
.salesHeader > div:first-child > span,
.productInsight span,
.salesHighlights span,
.salesTotal span,
.salesRead span {
  color: #74d8ff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.productHeader h2,
.salesHeader h2 {
  margin: 7px 0 0;
  font-size: clamp(22px, 3vw, 32px);
  letter-spacing: -0.025em;
}

.productHeader p,
.salesHeader p {
  max-width: 650px;
  margin: 10px 0 0;
  color: #8196a0;
  font-size: 13px;
  line-height: 1.65;
}

.productHeadline {
  min-width: 150px;
  padding-left: 24px;
  border-left: 1px solid rgba(130, 170, 190, 0.12);
}

.productHeadline > span {
  display: block;
  color: #f2f7f9;
  font-size: 30px;
  font-weight: 800;
}

.productHeadline small {
  color: #66808c;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.productInsight {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 24px;
}

.productInsight > div {
  padding: 16px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.022);
}

.productInsight strong {
  display: block;
  margin-top: 7px;
  font-size: 16px;
}

.productInsight small {
  display: block;
  margin-top: 4px;
  color: #7b929d;
}

.productList {
  display: grid;
  gap: 6px;
  margin-top: 18px;
}

.productRow {
  display: grid;
  grid-template-columns:
    minmax(170px, 0.9fr)
    minmax(340px, 2fr)
    100px
    90px
    90px;
  gap: 18px;
  align-items: center;
  min-height: 72px;
  padding: 12px 15px;
  border: 1px solid rgba(130, 170, 190, 0.07);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.016);
}

.productName strong {
  display: block;
  font-size: 13px;
}

.productName span {
  display: block;
  margin-top: 4px;
  color: #627d89;
  font-size: 10px;
}

.productCalorificMeta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.productCalorificMeta span,
.productQuality span {
  color: #62818e;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

.productCalorificMeta strong {
  color: #dcebef;
  font-size: 11px;
}

.productTrack {
  height: 7px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.045);
}

.productFill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #d79235, #f4c45e);
}

.productQuality strong {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

.productNote {
  margin-top: 14px;
  padding: 11px 13px;
  border-left: 2px solid rgba(240, 183, 75, 0.35);
  color: #69818d;
  background: rgba(240, 183, 75, 0.025);
  font-size: 10px;
  line-height: 1.6;
}


/* ==================================================
   BUILD #3 — SALES GEOGRAPHY
   ================================================== */

.salesTotal {
  min-width: 220px;
  padding-left: 24px;
  border-left: 1px solid rgba(130, 170, 190, 0.12);
}

.salesTotal strong {
  display: block;
  margin-top: 6px;
  font-size: 28px;
}

.salesTotal small {
  display: block;
  margin-top: 4px;
  color: #6c8590;
  font-size: 10px;
}

.salesHighlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-top: 24px;
}

.salesHighlights > div {
  padding: 16px;
  border: 1px solid rgba(130, 170, 190, 0.07);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.018);
}

.salesHighlights strong {
  display: block;
  margin-top: 7px;
  font-size: 21px;
}

.salesHighlights small {
  display: block;
  margin-top: 4px;
  color: #6c8590;
  font-size: 10px;
}

.salesRanking {
  display: grid;
  gap: 6px;
  margin-top: 18px;
}

.salesRow {
  display: grid;
  grid-template-columns: 34px 170px 1fr;
  gap: 15px;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid rgba(130, 170, 190, 0.07);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.016);
}

.salesRank {
  color: #4c6875;
  font-size: 10px;
  font-weight: 800;
}

.salesCountry strong {
  display: block;
  font-size: 13px;
}

.salesCountry small {
  display: block;
  margin-top: 3px;
  color: #617b87;
  font-size: 9px;
}

.salesBarMeta {
  display: flex;
  justify-content: space-between;
}

.salesBarMeta span {
  color: #68838f;
  font-size: 10px;
}

.salesBarMeta strong {
  color: #e2edf0;
  font-size: 11px;
}

.salesTrack {
  height: 8px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.045);
}

.salesFill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #278f73, #58dbae);
}

.salesRead {
  margin-top: 18px;
  padding: 17px;
  border: 1px solid rgba(84, 212, 174, 0.12);
  border-radius: 14px;
  background: rgba(39, 148, 115, 0.04);
}

.salesRead p {
  margin: 7px 0 0;
  color: #9bb0b8;
  font-size: 12px;
  line-height: 1.65;
}

@media (max-width: 1000px) {
  .productRow {
    grid-template-columns:
      minmax(160px, 0.8fr)
      minmax(250px, 1.5fr)
      90px
      80px;
  }

  .productRow .productQuality:last-child {
    display: none;
  }
}

@media (max-width: 760px) {
  .productSection,
  .salesSection {
    padding: 19px;
  }

  .productHeader,
  .salesHeader {
    flex-direction: column;
    align-items: stretch;
  }

  .productHeadline,
  .salesTotal {
    padding-top: 14px;
    padding-left: 0;
    border-top: 1px solid rgba(130, 170, 190, 0.12);
    border-left: 0;
  }

  .productInsight,
  .salesHighlights {
    grid-template-columns: 1fr;
  }

  .productRow {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .productRow .productQuality:last-child {
    display: block;
  }

  .salesRow {
    grid-template-columns: 28px 110px 1fr;
  }
}

@media (max-width: 520px) {
  .salesRow {
    grid-template-columns: 26px 1fr;
  }

  .salesBarArea {
    grid-column: 2;
  }
}
'@
}


# ====================================================
# 8. VALIDATION
# ====================================================

Write-Host ""
Write-Host "=== TYPECHECK ==="

npx tsc --noEmit

if ($LASTEXITCODE -ne 0) {
    Write-Host "TYPECHECK : FAIL"
    exit 1
}

Write-Host "TYPECHECK : PASS"

Write-Host ""
Write-Host "=== ESLINT ==="

npx eslint `
    ".\src\app\company-lab\page.tsx" `
    ".\src\components\rxmdi\company-lab\*.ts" `
    ".\src\components\rxmdi\company-lab\*.tsx"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ESLINT : FAIL"
    exit 1
}

Write-Host "ESLINT : PASS"

Write-Host ""
Write-Host "===================================================="
Write-Host " BUILD #3 COMPLETE"
Write-Host " PRODUCTS : $(@($productRows).Count)"
Write-Host " MARKETS  : $(@($salesRows).Count)"
Write-Host " OPEN     : http://localhost:3000/company-lab"
Write-Host "===================================================="