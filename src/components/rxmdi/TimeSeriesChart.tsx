"use client";

import {
  useRef,
  useState,
} from "react";

import styles from "./TimeSeriesChart.module.css";

export interface RXTimeSeriesPoint {
  date: string;
  value: number;
  unit: string;
}

interface TimeSeriesChartProps {
  label: string;
  series: RXTimeSeriesPoint[];
}

interface PositionedPoint
  extends RXTimeSeriesPoint {
  x: number;
  y: number;
  index: number;
}

function formatValue(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
      notation:
        Math.abs(value) >= 1000000
          ? "compact"
          : "standard",
    },
  ).format(value);
}

export default function TimeSeriesChart({
  label,
  series,
}: TimeSeriesChartProps) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(
    null,
  );

  const chartRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  if (series.length === 0) {
    return null;
  }

  const width = 800;
  const height = 220;
  const paddingX = 24;
  const paddingY = 24;

  const values =
    series.map(
      (point) => point.value,
    );

  const minValue =
    Math.min(...values);

  const maxValue =
    Math.max(...values);

  const range =
    maxValue - minValue;

  const plotWidth =
    width - paddingX * 2;

  const plotHeight =
    height - paddingY * 2;

  const coordinates:
    PositionedPoint[] =
    series.map(
      (point, index) => {
        const x =
          series.length === 1
            ? width / 2
            : paddingX +
              (
                index /
                (series.length - 1)
              ) *
                plotWidth;

        const y =
          range === 0
            ? height / 2
            : paddingY +
              (
                1 -
                (
                  point.value -
                  minValue
                ) /
                  range
              ) *
                plotHeight;

        return {
          ...point,
          x,
          y,
          index,
        };
      },
    );

  const polyline =
    coordinates
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(" ");

  const first =
    series[0];

  const latest =
    series[
      series.length - 1
    ];

  if (!first || !latest) {
    return null;
  }

  const activePoint =
    activeIndex === null
      ? null
      : coordinates[
          activeIndex
        ] ?? null;

  function activatePoint(
    index: number,
  ) {
    setActiveIndex(index);
  }

  function togglePoint(
    index: number,
  ) {
    setActiveIndex(
      (current) =>
        current === index
          ? null
          : index,
    );
  }

  function clearActivePoint() {
    setActiveIndex(null);
  }

  function handleChartPointerDown(
    event:
      React.PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
      chartRef.current
    ) {
      clearActivePoint();
    }
  }

  function getTooltipClasses(
    point: PositionedPoint,
  ): string {
    const classes = [
      styles.tooltip,
    ];

    if (
      point.x <
      width * 0.32
    ) {
      classes.push(
        styles.tooltipLeft,
      );
    } else if (
      point.x >
      width * 0.68
    ) {
      classes.push(
        styles.tooltipRight,
      );
    } else {
      classes.push(
        styles.tooltipCenter,
      );
    }

    /*
     * Important:
     * points near the top edge cannot
     * safely place the tooltip above
     * themselves because the chart card
     * intentionally clips its contents.
     *
     * In that region the tooltip flips
     * below the selected observation.
     */
    if (
      point.y <
      height * 0.42
    ) {
      classes.push(
        styles.tooltipBelow,
      );
    } else {
      classes.push(
        styles.tooltipAbove,
      );
    }

    return classes.join(" ");
  }

  return (
    <article
      className={styles.card}
      onMouseLeave={() => {
        if (
          typeof window !==
            "undefined" &&
          window.matchMedia(
            "(hover: hover)",
          ).matches
        ) {
          clearActivePoint();
        }
      }}
    >
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            OBSERVED TREND
          </span>

          <h3>
            {label}
          </h3>
        </div>

        <span className={styles.count}>
          {series.length} OBS
        </span>
      </div>

      <div
        ref={chartRef}
        className={styles.chart}
        onPointerDown={
          handleChartPointerDown
        }
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${label} admitted observation trend`}
          preserveAspectRatio="none"
        >
          <line
            className={styles.grid}
            x1={paddingX}
            x2={
              width -
              paddingX
            }
            y1={paddingY}
            y2={paddingY}
          />

          <line
            className={styles.grid}
            x1={paddingX}
            x2={
              width -
              paddingX
            }
            y1={height / 2}
            y2={height / 2}
          />

          <line
            className={styles.grid}
            x1={paddingX}
            x2={
              width -
              paddingX
            }
            y1={
              height -
              paddingY
            }
            y2={
              height -
              paddingY
            }
          />

          {coordinates.length >
          1 ? (
            <polyline
              className={
                styles.line
              }
              points={
                polyline
              }
            />
          ) : null}

          {coordinates.map(
            (point) => (
              <g
                key={`${point.date}:${point.value}:${point.index}`}
                className={
                  styles.pointGroup
                }
                tabIndex={0}
                role="button"
                aria-label={`${label}, ${point.date}, ${point.value} ${point.unit}`}
                onMouseEnter={() =>
                  activatePoint(
                    point.index,
                  )
                }
                onFocus={() =>
                  activatePoint(
                    point.index,
                  )
                }
                onBlur={() => {
                  if (
                    typeof window !==
                      "undefined" &&
                    window.matchMedia(
                      "(hover: hover)",
                    ).matches
                  ) {
                    clearActivePoint();
                  }
                }}
                onPointerDown={(
                  event,
                ) => {
                  event.stopPropagation();

                  if (
                    event.pointerType ===
                    "touch"
                  ) {
                    event.preventDefault();

                    togglePoint(
                      point.index,
                    );
                  }
                }}
                onClick={(
                  event,
                ) => {
                  event.stopPropagation();

                  if (
                    typeof window ===
                      "undefined" ||
                    window.matchMedia(
                      "(hover: hover)",
                    ).matches
                  ) {
                    activatePoint(
                      point.index,
                    );
                  }
                }}
              >
                <circle
                  className={
                    styles.hitArea
                  }
                  cx={point.x}
                  cy={point.y}
                  r="22"
                />

                <circle
                  className={
                    activeIndex ===
                    point.index
                      ? `${styles.point} ${styles.pointActive}`
                      : styles.point
                  }
                  cx={point.x}
                  cy={point.y}
                  r={
                    activeIndex ===
                    point.index
                      ? "6"
                      : "4"
                  }
                />
              </g>
            ),
          )}
        </svg>

        {activePoint ? (
          <div
            className={getTooltipClasses(
              activePoint,
            )}
            style={{
              left:
                `${
                  (
                    activePoint.x /
                    width
                  ) *
                  100
                }%`,
              top:
                `${
                  (
                    activePoint.y /
                    height
                  ) *
                  100
                }%`,
            }}
          >
            <span
              className={
                styles.tooltipLabel
              }
            >
              ADMITTED OBSERVATION
            </span>

            <strong>
              {label}
            </strong>

            <div
              className={
                styles.tooltipValue
              }
            >
              {formatValue(
                activePoint.value,
              )}
              {" "}
              {activePoint.unit}
            </div>

            <small>
              {activePoint.date}
            </small>
          </div>
        ) : null}
      </div>

      <div className={styles.scale}>
        <span>
          HIGH{" "}
          <strong>
            {formatValue(
              maxValue,
            )}
          </strong>
        </span>

        <span>
          LOW{" "}
          <strong>
            {formatValue(
              minValue,
            )}
          </strong>
        </span>
      </div>

      <div className={styles.footer}>
        <div>
          <span>
            FIRST
          </span>

          <strong>
            {formatValue(
              first.value,
            )}{" "}
            {first.unit}
          </strong>

          <small>
            {first.date}
          </small>
        </div>

        <div>
          <span>
            LATEST
          </span>

          <strong>
            {formatValue(
              latest.value,
            )}{" "}
            {latest.unit}
          </strong>

          <small>
            {latest.date}
          </small>
        </div>
      </div>

      <p className={styles.note}>
        Visual scale represents admitted
        observations only. No interpolation,
        prediction, or causal inference.
      </p>
    </article>
  );
}