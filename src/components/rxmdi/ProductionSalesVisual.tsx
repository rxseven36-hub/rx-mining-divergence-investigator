"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type PointerEvent,
} from "react";

import {
  getHistoricalOperationalSnapshot,
  type HistoricalOperationalPoint,
} from "@/data/historicalOperationalSnapshots";

import styles from "./ProductionSalesVisual.module.css";

type Props = {
  symbol: string;
  year: number | string;
  production: number | null | undefined;
  sales: number | null | undefined;
  unit?: string | null;
};

type PositionedHistoricalPoint = {
  point: HistoricalOperationalPoint;
  index: number;
  x: number;
  anchorY: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeValue(
  value: number | null | undefined,
): number | null {
  return value != null && Number.isFinite(Number(value))
    ? Number(value)
    : null;
}

function valuesMatch(
  left: number | null,
  right: number | null,
) {
  if (left === null || right === null) {
    return left === right;
  }

  return Math.abs(left - right) < 0.000001;
}

function HistoricalTrend({
  symbol,
  points,
  unit,
}: {
  symbol: string;
  points: HistoricalOperationalPoint[];
  unit: string;
}) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(null);

  const chartRef =
    useRef<HTMLDivElement | null>(null);

  const values = points.flatMap((point) => [
    ...(point.production === null ? [] : [point.production]),
    ...(point.sales === null ? [] : [point.sales]),
  ]);

  if (values.length === 0) {
    return null;
  }

  const width = 800;
  const height = 250;
  const paddingX = 46;
  const paddingTop = 26;
  const paddingBottom = 44;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const xFor = (index: number) =>
    points.length === 1
      ? width / 2
      : paddingX +
        (index / (points.length - 1)) * plotWidth;

  const yFor = (value: number) =>
    paddingTop +
    (1 - (value - minValue) / range) * plotHeight;

  const productionPoints = points.flatMap((point, index) =>
    point.production === null
      ? []
      : [{
          x: xFor(index),
          y: yFor(point.production),
          point,
        }],
  );

  const salesSegments: Array<
    Array<{
      x: number;
      y: number;
      point: HistoricalOperationalPoint;
    }>
  > = [];

  let currentSalesSegment: Array<{
    x: number;
    y: number;
    point: HistoricalOperationalPoint;
  }> = [];

  points.forEach((point, index) => {
    if (point.sales === null) {
      if (currentSalesSegment.length > 0) {
        salesSegments.push(currentSalesSegment);
        currentSalesSegment = [];
      }

      return;
    }

    currentSalesSegment.push({
      x: xFor(index),
      y: yFor(point.sales),
      point,
    });
  });

  if (currentSalesSegment.length > 0) {
    salesSegments.push(currentSalesSegment);
  }

  const positionedPoints: PositionedHistoricalPoint[] =
    points.map((point, index) => {
      const admittedY = [
        ...(point.production === null
          ? []
          : [yFor(point.production)]),
        ...(point.sales === null
          ? []
          : [yFor(point.sales)]),
      ];

      const anchorY =
        admittedY.length > 0
          ? admittedY.reduce((sum, value) => sum + value, 0) /
            admittedY.length
          : height / 2;

      return {
        point,
        index,
        x: xFor(index),
        anchorY,
      };
    });

  const activePoint =
    activeIndex === null
      ? null
      : positionedPoints[activeIndex] ?? null;

  function activatePoint(index: number) {
    setActiveIndex(index);
  }

  function togglePoint(index: number) {
    setActiveIndex((current) =>
      current === index ? null : index,
    );
  }

  function clearActivePoint() {
    setActiveIndex(null);
  }

  function handleChartPointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (event.target === chartRef.current) {
      clearActivePoint();
    }
  }

  function getTooltipClasses(
    positioned: PositionedHistoricalPoint,
  ) {
    const classes = [styles.historicalTooltip];

    if (positioned.x < width * 0.32) {
      classes.push(styles.historicalTooltipLeft);
    } else if (positioned.x > width * 0.68) {
      classes.push(styles.historicalTooltipRight);
    } else {
      classes.push(styles.historicalTooltipCenter);
    }

    if (positioned.anchorY < height * 0.42) {
      classes.push(styles.historicalTooltipBelow);
    } else {
      classes.push(styles.historicalTooltipAbove);
    }

    return classes.join(" ");
  }

  const activeObservation =
    activePoint?.point ?? null;

  const activeGap =
    activeObservation !== null &&
    activeObservation.production !== null &&
    activeObservation.sales !== null
      ? activeObservation.sales - activeObservation.production
      : null;

  return (
    <section
      className={styles.historical}
      aria-label={`${symbol} historical production and sales`}
      onMouseLeave={() => {
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(hover: hover)").matches
        ) {
          clearActivePoint();
        }
      }}
    >
      <div className={styles.historicalHeader}>
        <div>
          <span>HISTORICAL OPERATING TREND</span>
          <h4>Production vs sales · 2020–2024</h4>
        </div>

        <div className={styles.legend}>
          <span>
            <i className={styles.productionDot} />
            Production
          </span>

          <span>
            <i className={styles.salesDot} />
            Sales
          </span>
        </div>
      </div>

      <div
        ref={chartRef}
        className={styles.historicalChart}
        onPointerDown={handleChartPointerDown}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${symbol} admitted production and sales observations from 2020 to 2024`}
          preserveAspectRatio="none"
        >
          {[paddingTop, height / 2, height - paddingBottom].map(
            (y) => (
              <line
                key={y}
                className={styles.gridLine}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
              />
            ),
          )}

          {productionPoints.length > 1 ? (
            <polyline
              className={styles.productionLine}
              points={productionPoints
                .map(({ x, y }) => `${x},${y}`)
                .join(" ")}
            />
          ) : null}

          {salesSegments.map((segment, index) =>
            segment.length > 1 ? (
              <polyline
                key={index}
                className={styles.salesLine}
                points={segment
                  .map(({ x, y }) => `${x},${y}`)
                  .join(" ")}
              />
            ) : null,
          )}

          {productionPoints.map(({ x, y, point }) => (
            <circle
              key={`production-${point.year}`}
              className={
                activePoint?.point.year === point.year
                  ? `${styles.productionPoint} ${styles.historicalPointActive}`
                  : styles.productionPoint
              }
              cx={x}
              cy={y}
              r={
                activePoint?.point.year === point.year
                  ? "6"
                  : "5"
              }
            />
          ))}

          {salesSegments.flat().map(({ x, y, point }) => (
            <circle
              key={`sales-${point.year}`}
              className={
                activePoint?.point.year === point.year
                  ? `${styles.salesPoint} ${styles.historicalPointActive}`
                  : styles.salesPoint
              }
              cx={x}
              cy={y}
              r={
                activePoint?.point.year === point.year
                  ? "6"
                  : "5"
              }
            />
          ))}

          {positionedPoints.map((positioned, index) => {
            const previousX =
              index === 0
                ? paddingX
                : (positionedPoints[index - 1].x + positioned.x) / 2;
            const nextX =
              index === positionedPoints.length - 1
                ? width - paddingX
                : (positioned.x + positionedPoints[index + 1].x) / 2;

            return (
              <g
                key={`interaction-${positioned.point.year}`}
                className={styles.historicalInteraction}
                tabIndex={0}
                role="button"
                aria-label={`${symbol}, ${positioned.point.year}, Production ${
                  positioned.point.production === null
                    ? "not admitted"
                    : `${formatNumber(positioned.point.production)} ${unit}`
                }, Sales ${
                  positioned.point.sales === null
                    ? "not admitted"
                    : `${formatNumber(positioned.point.sales)} ${unit}`
                }`}
                onMouseEnter={() => activatePoint(positioned.index)}
                onFocus={() => activatePoint(positioned.index)}
                onBlur={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.matchMedia("(hover: hover)").matches
                  ) {
                    clearActivePoint();
                  }
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();

                  if (event.pointerType === "touch") {
                    event.preventDefault();
                    togglePoint(positioned.index);
                  }
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  if (
                    typeof window === "undefined" ||
                    window.matchMedia("(hover: hover)").matches
                  ) {
                    activatePoint(positioned.index);
                  }
                }}
              >
                <rect
                  className={styles.historicalHitArea}
                  x={previousX}
                  y={paddingTop}
                  width={Math.max(nextX - previousX, 1)}
                  height={plotHeight}
                />
              </g>
            );
          })}

          {points.map((point, index) => (
            <text
              key={point.year}
              className={styles.yearLabel}
              x={xFor(index)}
              y={height - 13}
              textAnchor="middle"
            >
              {point.year}
            </text>
          ))}
        </svg>

        {activePoint ? (
          <div
            className={getTooltipClasses(activePoint)}
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.anchorY / height) * 100}%`,
            }}
          >
            <span className={styles.historicalTooltipLabel}>
              ADMITTED OBSERVATION · {activePoint.point.year}
            </span>

            <strong>{symbol}</strong>

            <div className={styles.historicalTooltipRows}>
              <span>
                Production
                <b>
                  {activePoint.point.production === null
                    ? "Not admitted"
                    : `${formatNumber(activePoint.point.production)} ${unit}`}
                </b>
              </span>

              <span>
                Sales
                <b>
                  {activePoint.point.sales === null
                    ? "Not admitted"
                    : `${formatNumber(activePoint.point.sales)} ${unit}`}
                </b>
              </span>

              <span>
                Observed gap
                <b>
                  {activeGap === null
                    ? "Not comparable"
                    : `${activeGap > 0 ? "+" : activeGap < 0 ? "-" : ""}${formatNumber(
                        Math.abs(activeGap),
                      )} ${unit}`}
                </b>
              </span>
            </div>

            <small>
              Observed relationship · not causal
            </small>
          </div>
        ) : null}
      </div>

      <div className={styles.historicalRows}>
        {points.map((point) => (
          <div
            className={styles.historicalRow}
            key={point.year}
          >
            <strong>{point.year}</strong>

            <span>
              Production{" "}
              <b>
                {point.production === null
                  ? "Not admitted"
                  : `${formatNumber(point.production)} ${unit}`}
              </b>
            </span>

            <span>
              Sales{" "}
              <b>
                {point.sales === null
                  ? "Not admitted"
                  : `${formatNumber(point.sales)} ${unit}`}
              </b>
            </span>
          </div>
        ))}
      </div>

      <p className={styles.historicalNote}>
        Admitted observations only. Missing values remain missing;
        RX MDI does not interpolate, predict, or infer causality
        between production and sales.
      </p>
    </section>
  );
}

export function ProductionSalesVisual({
  symbol,
  year,
  production,
  sales,
  unit,
}: Props) {
  const productionValue = normalizeValue(production);
  const salesValue = normalizeValue(sales);
  const displayUnit = unit?.trim() || "Mt";

  const historical =
    getHistoricalOperationalSnapshot(symbol);

  const historical2024 =
    historical?.points.find(
      (point) => point.year === 2024,
    ) ?? null;

  const snapshotYear = Number(year);

  const historicalReconciled =
    historical2024 !== null &&
    snapshotYear === 2024 &&
    valuesMatch(
      historical2024.production,
      productionValue,
    ) &&
    valuesMatch(
      historical2024.sales,
      salesValue,
    );

  const historicalSafe =
    historical &&
    (snapshotYear !== 2024 || historicalReconciled)
      ? historical
      : null;

  if (productionValue === null || salesValue === null) {
    return (
      <article className={styles.visual}>
        <div className={styles.heading}>
          <div>
            <span>VISUAL INTELLIGENCE / {year}</span>
            <h3>Production vs sales</h3>
          </div>

          <span className={styles.state}>
            INSUFFICIENT DATA
          </span>
        </div>

        <div className={styles.unavailable}>
          <strong>
            No comparable production / sales pair
          </strong>

          <p>
            RX MDI does not estimate missing operational values.
          </p>
        </div>

        {historicalSafe ? (
          <HistoricalTrend
            symbol={symbol}
            points={historicalSafe.points}
            unit={historicalSafe.unit}
          />
        ) : null}
      </article>
    );
  }

  const maxValue = Math.max(
    productionValue,
    salesValue,
    1,
  );

  const productionWidth =
    (productionValue / maxValue) * 100;

  const salesWidth =
    (salesValue / maxValue) * 100;

  const gap = salesValue - productionValue;
  const absoluteGap = Math.abs(gap);

  const relativeGap =
    productionValue !== 0
      ? (absoluteGap / Math.abs(productionValue)) * 100
      : null;

  const direction =
    gap > 0
      ? "Sales exceeded reported production"
      : gap < 0
        ? "Production exceeded reported sales"
        : "Production and sales were equal";

  return (
    <article className={styles.visual}>
      <div className={styles.heading}>
        <div>
          <span>VISUAL INTELLIGENCE / {year}</span>
          <h3>Production vs sales</h3>
        </div>

        <span className={styles.state}>
          OBSERVED GAP
        </span>
      </div>

      <div className={styles.chart}>
        <div className={styles.row}>
          <div className={styles.label}>
            <span>PRODUCTION</span>
            <strong>
              {formatNumber(productionValue)} {displayUnit}
            </strong>
          </div>

          <div className={styles.track}>
            <div
              className={`${styles.bar} ${styles.production}`}
              style={{
                width: `${productionWidth}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>
            <span>SALES</span>
            <strong>
              {formatNumber(salesValue)} {displayUnit}
            </strong>
          </div>

          <div className={styles.track}>
            <div
              className={`${styles.bar} ${styles.sales}`}
              style={{
                width: `${salesWidth}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.intelligence}>
        <div>
          <span>OBSERVED GAP</span>
          <strong>
            {gap > 0 ? "+" : gap < 0 ? "-" : ""}
            {formatNumber(absoluteGap)} {displayUnit}
          </strong>
        </div>

        <div>
          <span>RELATIVE TO PRODUCTION</span>
          <strong>
            {relativeGap !== null
              ? `${relativeGap.toFixed(1)}%`
              : "N/A"}
          </strong>
        </div>

        <div className={styles.readout}>
          <span>WHAT THE DATA SHOWS</span>
          <strong>{direction}</strong>

          <small>
            This is an observed numerical relationship,
            not a causal conclusion.
          </small>
        </div>
      </div>

      {historicalSafe ? (
        <HistoricalTrend
          symbol={symbol}
          points={historicalSafe.points}
          unit={historicalSafe.unit}
        />
      ) : historical ? (
        <div className={styles.historyGuard}>
          <strong>Historical trend withheld</strong>

          <p>
            The 2024 historical observation does not reconcile
            with the current FY2024 snapshot. RX MDI will not
            silently merge conflicting operational values.
          </p>
        </div>
      ) : null}

      <div className={styles.footer}>
        <p>
          Compare the reported operational values first,
          then open the investigation layer for
          evidence-bounded analysis.
        </p>

        <Link
          href={`/investigations?symbol=${symbol}&path=production-sales`}
        >
          Investigate {symbol}
        </Link>
      </div>
    </article>
  );
}
