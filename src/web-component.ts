import { createEmbedFrame, isKnownMap, type EmbedFrame } from "./embed-url";

export const TAG_NAME = "heatmap-247";

const ATTRIBUTES = [
  "map",
  "theme",
  "height",
  "width",
  "tickers",
  "attribution",
  "live",
  "metric",
  "size",
  "title",
] as const;

export interface ElementRegistry {
  get(name: string): unknown;
  define(name: string, constructor: CustomElementConstructor): void;
}

const ElementBase: typeof HTMLElement =
  typeof HTMLElement !== "undefined" ? HTMLElement : (class {} as typeof HTMLElement);

function frameFromHost(host: HTMLElement): EmbedFrame {
  const attr = (name: string) => host.getAttribute(name);
  return createEmbedFrame({
    map: attr("map"),
    theme: attr("theme"),
    height: attr("height"),
    width: attr("width"),
    tickers: attr("tickers"),
    attribution: attr("attribution"),
    live: attr("live"),
    metric: attr("metric"),
    size: attr("size"),
    title: attr("title"),
  });
}

function paint(root: ShadowRoot, frame: EmbedFrame): void {
  const iframe = root.querySelector("iframe");
  if (!(iframe instanceof HTMLIFrameElement)) return;
  iframe.src = frame.src;
  iframe.title = frame.title;
  iframe.width = frame.width;
  iframe.height = /^\d+(\.\d+)?px$/.test(frame.height) ? frame.height.slice(0, -2) : frame.height;
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.width = frame.width;
  iframe.style.height = frame.height;
  iframe.style.minHeight = "360px";
  iframe.style.background = frame.background;

  const credit = root.querySelector("[data-credit]");
  if (credit) credit.remove();
  if (!frame.showAttribution) return;

  const paragraph = document.createElement("p");
  paragraph.dataset.credit = "";
  paragraph.part = "attribution";
  paragraph.style.color = frame.chromeTheme === "light" ? "#5b6673" : "#9aa6b8";
  const lead = document.createTextNode("Live market map by ");
  const link = document.createElement("a");
  link.href = "https://247heatmap.com/";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "247heatmap.com";
  paragraph.append(lead, link);
  root.append(paragraph);
}

export class Heatmap247Element extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ATTRIBUTES;
  }

  #warned = false;

  connectedCallback(): void {
    this.#upgrade();
    this.#render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#render();
  }

  #upgrade(): void {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; width: 100%; }
      iframe { border: 0; display: block; width: 100%; min-height: 360px; }
      p {
        margin: 6px 0 0;
        font: 12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #9aa6b8;
      }
      a { color: inherit; text-underline-offset: 2px; }
    `;
    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    root.append(style, iframe);
  }

  #render(): void {
    const map = this.getAttribute("map");
    if (!this.#warned && !isKnownMap(map) && typeof console !== "undefined") {
      this.#warned = true;
      console.warn(
        `[heatmap-247] Unknown map "${map}". Using sp500. Verified maps: sp500, nasdaq-100, dow-30, custom.`,
      );
    }
    const root = this.shadowRoot;
    if (!root) return;
    paint(root, frameFromHost(this));
  }
}

export function defineHeatmap247(registry?: ElementRegistry): void {
  const scope: ElementRegistry | undefined =
    registry ?? (typeof customElements !== "undefined" ? customElements : undefined);
  if (!scope || typeof scope.get !== "function" || typeof scope.define !== "function") return;
  if (scope.get(TAG_NAME)) return;
  if (typeof HTMLElement === "undefined") return;
  scope.define(TAG_NAME, Heatmap247Element);
}

defineHeatmap247();
