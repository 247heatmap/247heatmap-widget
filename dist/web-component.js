/*!
 * 247heatmap-widget
 * Free live stock, ETF, and crypto heatmap embeds from https://247heatmap.com/embed/
 * MIT License — Copyright (c) 2026 247heatmap.com
 */
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/embed-url.ts
var EMBED_ORIGIN = "https://247heatmap.com";
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

// src/web-component.ts
var TAG_NAME = "heatmap-247";
var ATTRIBUTES = [
  "map",
  "theme",
  "height",
  "width",
  "tickers",
  "attribution",
  "live",
  "metric",
  "size",
  "title"
];
var ElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
function frameFromHost(host) {
  const attr = (name) => host.getAttribute(name);
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
    title: attr("title")
  });
}
function paint(root, frame) {
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
var _warned, _Heatmap247Element_instances, upgrade_fn, render_fn;
var Heatmap247Element = class extends ElementBase {
  constructor() {
    super(...arguments);
    __privateAdd(this, _Heatmap247Element_instances);
    __privateAdd(this, _warned, false);
  }
  static get observedAttributes() {
    return ATTRIBUTES;
  }
  connectedCallback() {
    __privateMethod(this, _Heatmap247Element_instances, upgrade_fn).call(this);
    __privateMethod(this, _Heatmap247Element_instances, render_fn).call(this);
  }
  attributeChangedCallback() {
    if (this.isConnected) __privateMethod(this, _Heatmap247Element_instances, render_fn).call(this);
  }
};
_warned = new WeakMap();
_Heatmap247Element_instances = new WeakSet();
upgrade_fn = function() {
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
};
render_fn = function() {
  const map = this.getAttribute("map");
  if (!__privateGet(this, _warned) && !isKnownMap(map) && typeof console !== "undefined") {
    __privateSet(this, _warned, true);
    console.warn(
      `[heatmap-247] Unknown map "${map}". Using sp500. Verified maps: sp500, nasdaq-100, dow-30, custom.`
    );
  }
  const root = this.shadowRoot;
  if (!root) return;
  paint(root, frameFromHost(this));
};
function defineHeatmap247(registry) {
  const scope = registry != null ? registry : typeof customElements !== "undefined" ? customElements : void 0;
  if (!scope || typeof scope.get !== "function" || typeof scope.define !== "function") return;
  if (scope.get(TAG_NAME)) return;
  if (typeof HTMLElement === "undefined") return;
  scope.define(TAG_NAME, Heatmap247Element);
}
defineHeatmap247();
export {
  Heatmap247Element,
  TAG_NAME,
  defineHeatmap247
};
