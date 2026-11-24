/*!
 * 247heatmap-widget
 * Free live stock, ETF, and crypto heatmap embeds from https://247heatmap.com/embed/
 * MIT License — Copyright (c) 2026 247heatmap.com
 */

// src/react.tsx
import { createElement } from "react";

// src/embed-url.ts
var EMBED_ORIGIN = "https://247heatmap.com";
var ATTRIBUTION_HREF = "https://247heatmap.com/";
var ATTRIBUTION_LEAD = "Live market map by ";
var ATTRIBUTION_LABEL = "247heatmap.com";
var INDEX_MAPS = ["sp500", "nasdaq-100", "dow-30"];
var HEATMAP_MAPS = [...INDEX_MAPS, "custom"];
var MAP_ALIASES = {
  sp500: "sp500",
  "sp-500": "sp500",
  "s&p500": "sp500",
  "s&p-500": "sp500",
  "s&p 500": "sp500",
  spx: "sp500",
  "nasdaq-100": "nasdaq-100",
  nasdaq100: "nasdaq-100",
  nasdaq: "nasdaq-100",
  ndx: "nasdaq-100",
  "dow-30": "dow-30",
  dow30: "dow-30",
  dow: "dow-30",
  djia: "dow-30",
  custom: "custom"
};
var MAX_TICKERS = 60;
function normalizeMap(input) {
  var _a;
  if (input == null) return "sp500";
  const key = input.trim().toLowerCase();
  if (!key) return "sp500";
  return (_a = MAP_ALIASES[key]) != null ? _a : "sp500";
}
function isKnownMap(input) {
  if (input == null || input.trim() === "") return true;
  return Object.prototype.hasOwnProperty.call(MAP_ALIASES, input.trim().toLowerCase());
}
function normalizeTheme(input) {
  return input != null && input.trim().toLowerCase() === "light" ? "light" : "dark";
}
function normalizeMetric(input) {
  const key = input == null ? "" : input.trim().toLowerCase();
  if (key === "24h" || key === "24hr" || key === "24-hour" || key === "24hour") return "24h";
  if (key === "1h" || key === "1hr" || key === "1-hour" || key === "1hour") return "1h";
  return "close";
}
function normalizeSize(input) {
  const key = input == null ? "" : input.trim().toLowerCase();
  if (key === "equal" || key === "equal-size" || key === "same") return "equal";
  return "cap";
}
function normalizeTickers(input) {
  if (input == null) return [];
  const raw = typeof input === "string" ? input.split(/[\s,]+/) : input.flatMap((item) => String(item).split(/[\s,]+/));
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const part of raw) {
    const symbol = part.trim().toUpperCase().replace(/[^A-Z0-9.\-:]/g, "");
    if (!symbol || seen.has(symbol) || out.length >= MAX_TICKERS) continue;
    seen.add(symbol);
    out.push(symbol);
  }
  return out;
}
function parseLive(input) {
  if (typeof input === "boolean") return input;
  if (input == null) return false;
  const key = input.trim().toLowerCase();
  return key === "" || key === "1" || key === "true" || key === "yes" || key === "on";
}
function showAttribution(input) {
  if (typeof input === "boolean") return input;
  if (input == null) return true;
  const key = input.trim().toLowerCase();
  if (key === "") return true;
  return key !== "false" && key !== "0" && key !== "no" && key !== "off";
}
function iframeTitle(map) {
  switch (map) {
    case "nasdaq-100":
      return "Nasdaq-100 heat map \u2014 24/7 Heatmap";
    case "dow-30":
      return "Dow 30 heat map \u2014 24/7 Heatmap";
    case "custom":
      return "Custom stock heat map \u2014 24/7 Heatmap";
    default:
      return "S&P 500 heat map \u2014 24/7 Heatmap";
  }
}
function iframeBackground(map, theme) {
  if (map === "custom" || theme === "dark") return "#101216";
  return "#f4f6f8";
}
function cssSize(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text) return fallback;
  return /^-?\d+(\.\d+)?$/.test(text) ? `${text}px` : text;
}
function buildEmbedUrl(options = {}) {
  const map = normalizeMap(options.map);
  const theme = normalizeTheme(options.theme);
  const live = parseLive(options.live);
  if (map === "custom") {
    const parts = [];
    const tickers = normalizeTickers(options.tickers);
    if (tickers.length) {
      parts.push(`t=${tickers.map((symbol) => encodeURIComponent(symbol)).join(",")}`);
    }
    const metric = normalizeMetric(options.metric);
    if (metric !== "close") parts.push(`m=${metric}`);
    if (normalizeSize(options.size) === "equal") parts.push("s=equal");
    if (live) parts.push("live=1");
    const query = parts.join("&");
    return `${EMBED_ORIGIN}/embed/custom/${query ? `?${query}` : ""}`;
  }
  const base = `${EMBED_ORIGIN}/embed/${map}/${theme}/`;
  return live ? `${base}?live=1` : base;
}
function createEmbedFrame(options = {}) {
  var _a;
  const map = normalizeMap(options.map);
  const theme = normalizeTheme(options.theme);
  const chromeTheme = map === "custom" ? "dark" : theme;
  const title = ((_a = options.title) == null ? void 0 : _a.trim()) ? options.title.trim() : iframeTitle(map);
  return {
    map,
    theme,
    chromeTheme,
    src: buildEmbedUrl(options),
    title,
    width: cssSize(options.width, "100%"),
    height: cssSize(options.height, "480px"),
    background: iframeBackground(map, theme),
    showAttribution: showAttribution(options.attribution)
  };
}

// src/react.tsx
var warned = /* @__PURE__ */ new Set();
function warnUnknownMap(map) {
  if (map == null || map.trim() === "" || isKnownMap(map) || warned.has(map)) return;
  warned.add(map);
  if (typeof console !== "undefined") {
    console.warn(
      `[StockHeatmap] Unknown map "${map}". Using sp500. Verified maps: sp500, nasdaq-100, dow-30, custom.`
    );
  }
}
function StockHeatmap(props) {
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
    title: props.title
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
        background: frame.background
      }
    }),
    frame.showAttribution ? createElement(
      "p",
      {
        style: {
          margin: "6px 0 0",
          font: '12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif',
          color: creditColor
        }
      },
      ATTRIBUTION_LEAD,
      createElement(
        "a",
        { href: ATTRIBUTION_HREF, target: "_blank", rel: "noopener" },
        ATTRIBUTION_LABEL
      )
    ) : null
  );
}
StockHeatmap.displayName = "StockHeatmap";
var Heatmap247 = StockHeatmap;
export {
  Heatmap247,
  StockHeatmap
};
