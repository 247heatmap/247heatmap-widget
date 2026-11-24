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
export declare const EMBED_ORIGIN = "https://247heatmap.com";
export declare const ATTRIBUTION_HREF = "https://247heatmap.com/";
export declare const ATTRIBUTION_LEAD = "Live market map by ";
export declare const ATTRIBUTION_LABEL = "247heatmap.com";
export declare const INDEX_MAPS: readonly ["sp500", "nasdaq-100", "dow-30"];
export declare const HEATMAP_MAPS: readonly ["sp500", "nasdaq-100", "dow-30", "custom"];
export type IndexMap = (typeof INDEX_MAPS)[number];
export type HeatmapMap = (typeof HEATMAP_MAPS)[number];
export type HeatmapTheme = "dark" | "light";
export type HeatmapMetric = "close" | "24h" | "1h";
export type HeatmapSize = "cap" | "equal";
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
export declare function normalizeMap(input: string | null | undefined): HeatmapMap;
export declare function isKnownMap(input: string | null | undefined): boolean;
export declare function normalizeTheme(input: string | null | undefined): HeatmapTheme;
export declare function normalizeMetric(input: string | null | undefined): HeatmapMetric;
export declare function normalizeSize(input: string | null | undefined): HeatmapSize;
/**
 * Same ticker cleaning as 247heatmap.com/custom/: trim, uppercase, drop
 * anything outside A–Z 0–9 . - :, dedupe, cap at 60.
 */
export declare function normalizeTickers(input: string | readonly string[] | null | undefined): string[];
/** `live=""` (boolean HTML attribute) and common truthy strings count as on. */
export declare function parseLive(input: boolean | string | null | undefined): boolean;
/**
 * Attribution is on unless the caller passes a real off value.
 * Missing, null, and "" stay on so `<heatmap-247 attribution>` still credits the map.
 */
export declare function showAttribution(input: boolean | string | null | undefined): boolean;
export declare function iframeTitle(map: HeatmapMap): string;
export declare function iframeBackground(map: HeatmapMap, theme: HeatmapTheme): string;
export declare function cssSize(value: string | number | null | undefined, fallback: string): string;
export declare function buildEmbedUrl(options?: EmbedUrlOptions): string;
export declare function createEmbedFrame(options?: EmbedUrlOptions & {
    height?: string | number | null;
    width?: string | number | null;
    title?: string | null;
    attribution?: boolean | string | null;
}): EmbedFrame;
