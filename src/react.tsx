import { createElement, type CSSProperties, type ReactElement } from "react";
import {
  ATTRIBUTION_HREF,
  ATTRIBUTION_LABEL,
  ATTRIBUTION_LEAD,
  createEmbedFrame,
  isKnownMap,
  type HeatmapMetric,
  type HeatmapSize,
} from "./embed-url";

export interface StockHeatmapProps {
  /** Verified maps: `sp500` (default), `nasdaq-100`, `dow-30`, `custom`. */
  map?: string;
  /** `dark` (default) or `light`. Custom embeds are dark-only on 247heatmap.com. */
  theme?: string;
  /** Iframe height. Default `480px`. A bare number is pixels. */
  height?: string | number;
  /** Iframe width. Default `100%`. A bare number is pixels. */
  width?: string | number;
  /** Custom map only. Comma-separated symbols, or an array. Sent as `?t=`. */
  tickers?: string | readonly string[];
  /** Host-page credit under the iframe. Default `true`. The embed's own link stays. */
  attribution?: boolean;
  /** Production Live only switch. Adds `?live=1`. */
  live?: boolean;
  /** Custom map only: `close` (default), `24h`, or `1h`. */
  metric?: HeatmapMetric | string;
  /** Custom map only: `cap` (default) or `equal`. */
  size?: HeatmapSize | string;
  className?: string;
  style?: CSSProperties;
  /** Accessible iframe title. Defaults to the production title for the map. */
  title?: string;
}

const warned = new Set<string>();

function warnUnknownMap(map: string | undefined): void {
  if (map == null || map.trim() === "" || isKnownMap(map) || warned.has(map)) return;
  warned.add(map);
  if (typeof console !== "undefined") {
    console.warn(
      `[StockHeatmap] Unknown map "${map}". Using sp500. Verified maps: sp500, nasdaq-100, dow-30, custom.`,
    );
  }
}

/**
 * SSR-safe React component. Renders an iframe plus an optional attribution
 * line and does not touch `window`, so it can render in the Next.js App Router.
 */
export function StockHeatmap(props: StockHeatmapProps): ReactElement {
  warnUnknownMap(props.map);
  const frame = createEmbedFrame({
    map: props.map,
    theme: props.theme,
    height: props.height,
    width: props.width,
    tickers: props.tickers,
    attribution: props.attribution,
    live: props.live,
    metric: props.metric,
    size: props.size,
    title: props.title,
  });

  const creditColor = frame.chromeTheme === "light" ? "#5b6673" : "#9aa6b8";

  return createElement(
    "div",
    { className: props.className, style: props.style },
    createElement("iframe", {
      src: frame.src,
      title: frame.title,
      width: frame.width,
      height: /^\d+(\.\d+)?px$/.test(frame.height) ? frame.height.slice(0, -2) : frame.height,
      loading: "lazy",
      style: {
        border: 0,
        display: "block",
        width: frame.width,
        height: frame.height,
        minHeight: "360px",
        background: frame.background,
      },
    }),
    frame.showAttribution
      ? createElement(
          "p",
          {
            style: {
              margin: "6px 0 0",
              font: '12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif',
              color: creditColor,
            },
          },
          ATTRIBUTION_LEAD,
          createElement(
            "a",
            { href: ATTRIBUTION_HREF, target: "_blank", rel: "noopener" },
            ATTRIBUTION_LABEL,
          ),
        )
      : null,
  );
}

StockHeatmap.displayName = "StockHeatmap";

export const Heatmap247 = StockHeatmap;
