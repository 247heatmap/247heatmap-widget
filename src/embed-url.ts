/**
 * Live embed URLs for https://247heatmap.com/embed/
 *
 * Verified from production HTML on 2026-11-24:
 *
 * Index maps (theme is a path segment, optional `?live=1`):
 *   /embed/sp500/dark/       Heatmap247.mount({ index: "sp500", theme: "dark" })
 *   /embed/sp500/light/
 *   /embed/nasdaq-100/dark/  mount index "nasdaq100"
 *   /embed/nasdaq-100/light/
 *   /embed/dow-30/dark/      mount index "dow30"
 *   /embed/dow-30/light/
 *
 * Custom watchlist (no theme segment — `/embed/custom/dark/` is 404).
 * The page is `<html class="dark hm-emb">` and reads the same query the
 * "Embed this map" button copies from /custom/:
 *   /embed/custom/?t=NVDA,AAPL,BTC&m=24h&s=equal&live=1
 *     t     comma-separated tickers (max 60, charset A–Z 0–9 . - :)
 *     m     24h | 1h   (omitted when the default "close" / previous close)
 *     s     equal     (omitted when the default "cap" / market cap)
 *     live  1         (only tiles with a live price)
 *
 * There is no /embed/crypto/ route. Crypto, ETF, and commodity symbols
 * belong on the custom map (BTC, ETH, SPY, GOLD, …).
 */

export const EMBED_ORIGIN = "https://247heatmap.com";

export const ATTRIBUTION_HREF = "https://247heatmap.com/";
export const ATTRIBUTION_LEAD = "Live market map by ";
export const ATTRIBUTION_LABEL = "247heatmap.com";

export const INDEX_MAPS = ["sp500", "nasdaq-100", "dow-30"] as const;
export const HEATMAP_MAPS = [...INDEX_MAPS, "custom"] as const;

export type IndexMap = (typeof INDEX_MAPS)[number];
export type HeatmapMap = (typeof HEATMAP_MAPS)[number];
export type HeatmapTheme = "dark" | "light";
export type HeatmapMetric = "close" | "24h" | "1h";
export type HeatmapSize = "cap" | "equal";

/** Input aliases that still produce a verified production path. */
const MAP_ALIASES: Record<string, HeatmapMap> = {
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
  custom: "custom",
};

const MAX_TICKERS = 60;

export interface EmbedUrlOptions {
  map?: string | null;
  theme?: string | null;
  tickers?: string | readonly string[] | null;
  /** Adds the production `?live=1` flag (Live only). */
  live?: boolean | string | null;
  /** Custom maps only. `close` is omitted from the URL, matching production. */
  metric?: string | null;
  /** Custom maps only. `cap` is omitted from the URL, matching production. */
  size?: string | null;
}

export interface EmbedFrame {
  map: HeatmapMap;
  theme: HeatmapTheme;
  /** Theme of the hosted page. Custom embeds are dark-only. */
  chromeTheme: HeatmapTheme;
  src: string;
  title: string;
  width: string;
  height: string;
  background: string;
  showAttribution: boolean;
}

export function normalizeMap(input: string | null | undefined): HeatmapMap {
  if (input == null) return "sp500";
  const key = input.trim().toLowerCase();
  if (!key) return "sp500";
  return MAP_ALIASES[key] ?? "sp500";
}

export function isKnownMap(input: string | null | undefined): boolean {
  if (input == null || input.trim() === "") return true;
  return Object.prototype.hasOwnProperty.call(MAP_ALIASES, input.trim().toLowerCase());
}

export function normalizeTheme(input: string | null | undefined): HeatmapTheme {
  return input != null && input.trim().toLowerCase() === "light" ? "light" : "dark";
}

export function normalizeMetric(input: string | null | undefined): HeatmapMetric {
  const key = input == null ? "" : input.trim().toLowerCase();
  if (key === "24h" || key === "24hr" || key === "24-hour" || key === "24hour") return "24h";
  if (key === "1h" || key === "1hr" || key === "1-hour" || key === "1hour") return "1h";
  return "close";
}

export function normalizeSize(input: string | null | undefined): HeatmapSize {
  const key = input == null ? "" : input.trim().toLowerCase();
  if (key === "equal" || key === "equal-size" || key === "same") return "equal";
  return "cap";
}

/**
 * Same ticker cleaning as 247heatmap.com/custom/: trim, uppercase, drop
 * anything outside A–Z 0–9 . - :, dedupe, cap at 60.
 */
export function normalizeTickers(input: string | readonly string[] | null | undefined): string[] {
  if (input == null) return [];
  const raw = typeof input === "string" ? input.split(/[\s,]+/) : input.flatMap((item) => String(item).split(/[\s,]+/));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw) {
    const symbol = part.trim().toUpperCase().replace(/[^A-Z0-9.\-:]/g, "");
    if (!symbol || seen.has(symbol) || out.length >= MAX_TICKERS) continue;
    seen.add(symbol);
    out.push(symbol);
  }
  return out;
}

/** `live=""` (boolean HTML attribute) and common truthy strings count as on. */
export function parseLive(input: boolean | string | null | undefined): boolean {
  if (typeof input === "boolean") return input;
  if (input == null) return false;
  const key = input.trim().toLowerCase();
  return key === "" || key === "1" || key === "true" || key === "yes" || key === "on";
}

/**
 * Attribution is on unless the caller passes a real off value.
 * Missing, null, and "" stay on so `<heatmap-247 attribution>` still credits the map.
 */
export function showAttribution(input: boolean | string | null | undefined): boolean {
  if (typeof input === "boolean") return input;
  if (input == null) return true;
  const key = input.trim().toLowerCase();
  if (key === "") return true;
  return key !== "false" && key !== "0" && key !== "no" && key !== "off";
}

export function iframeTitle(map: HeatmapMap): string {
  switch (map) {
    case "nasdaq-100":
      return "Nasdaq-100 heat map — 24/7 Heatmap";
    case "dow-30":
      return "Dow 30 heat map — 24/7 Heatmap";
    case "custom":
      return "Custom stock heat map — 24/7 Heatmap";
    default:
      return "S&P 500 heat map — 24/7 Heatmap";
  }
}

export function iframeBackground(map: HeatmapMap, theme: HeatmapTheme): string {
  if (map === "custom" || theme === "dark") return "#101216";
  return "#f4f6f8";
}

export function cssSize(value: string | number | null | undefined, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text) return fallback;
  return /^-?\d+(\.\d+)?$/.test(text) ? `${text}px` : text;
}

export function buildEmbedUrl(options: EmbedUrlOptions = {}): string {
  const map = normalizeMap(options.map);
  const theme = normalizeTheme(options.theme);
  const live = parseLive(options.live);

  if (map === "custom") {
    const parts: string[] = [];
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

export function createEmbedFrame(options: EmbedUrlOptions & {
  height?: string | number | null;
  width?: string | number | null;
  title?: string | null;
  attribution?: boolean | string | null;
} = {}): EmbedFrame {
  const map = normalizeMap(options.map);
  const theme = normalizeTheme(options.theme);
  const chromeTheme: HeatmapTheme = map === "custom" ? "dark" : theme;
  const title = options.title?.trim() ? options.title.trim() : iframeTitle(map);
  return {
    map,
    theme,
    chromeTheme,
    src: buildEmbedUrl(options),
    title,
    width: cssSize(options.width, "100%"),
    height: cssSize(options.height, "480px"),
    background: iframeBackground(map, theme),
    showAttribution: showAttribution(options.attribution),
  };
}
