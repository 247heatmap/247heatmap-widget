import { type CSSProperties, type ReactElement } from "react";
import { type HeatmapMetric, type HeatmapSize } from "./embed-url";
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
/**
 * SSR-safe React component. Renders an iframe plus an optional attribution
 * line and does not touch `window`, so it can render in the Next.js App Router.
 */
export declare function StockHeatmap(props: StockHeatmapProps): ReactElement;
export declare namespace StockHeatmap {
    var displayName: string;
}
export declare const Heatmap247: typeof StockHeatmap;
