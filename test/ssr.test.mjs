import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { buildEmbedUrl } from "../dist/index.js";
import { Heatmap247, StockHeatmap } from "../dist/react.js";
import { TAG_NAME, defineHeatmap247 } from "../dist/web-component.js";

const require = createRequire(import.meta.url);

describe("SSR safety", () => {
  it("imports on the server without window", () => {
    assert.equal(typeof window, "undefined");
    assert.equal(typeof buildEmbedUrl, "function");
    assert.equal(typeof defineHeatmap247, "function");
    assert.equal(typeof StockHeatmap, "function");
    assert.equal(Heatmap247, StockHeatmap);
  });

  it("registers the custom element once and ignores a second call", () => {
    const calls = [];
    let current;
    const registry = {
      get(name) {
        return current && current.name === name ? current.ctor : undefined;
      },
      define(name, ctor) {
        calls.push(name);
        current = { name, ctor };
      },
    };
    const previous = globalThis.HTMLElement;
    globalThis.HTMLElement = class HTMLElement {};
    try {
      defineHeatmap247(registry);
      defineHeatmap247(registry);
    } finally {
      if (previous === undefined) delete globalThis.HTMLElement;
      else globalThis.HTMLElement = previous;
    }
    assert.deepEqual(calls, [TAG_NAME]);
    assert.equal(TAG_NAME, "heatmap-247");
  });

  it("defineHeatmap247() is a no-op when customElements is missing", () => {
    assert.equal(typeof customElements, "undefined");
    assert.doesNotThrow(() => defineHeatmap247());
  });

  it("renderToString covers every map, theme, and attribution switch", () => {
    const maps = ["sp500", "nasdaq-100", "dow-30", "custom"];
    const themes = ["dark", "light"];
    for (const map of maps) {
      for (const theme of themes) {
        for (const attribution of [true, false]) {
          const html = renderToString(
            React.createElement(StockHeatmap, {
              map,
              theme,
              attribution,
              tickers: map === "custom" ? ["NVDA", "AAPL", "BTC"] : undefined,
              height: 480,
              width: "100%",
              title: "Market map",
            }),
          );
          const expected = buildEmbedUrl({
            map,
            theme,
            tickers: map === "custom" ? ["NVDA", "AAPL", "BTC"] : undefined,
          });
          assert.ok(html.includes(`src="${expected}"`), `${map} ${theme} ${attribution} src`);
          assert.equal(html.includes("Live market map by "), attribution);
          assert.equal(html.includes('href="https://247heatmap.com/"'), attribution);
          assert.equal(html.includes('target="_blank"'), attribution);
          assert.equal(html.includes('rel="noopener"'), attribution);
          assert.ok(html.includes('title="Market map"'));
          assert.equal(html.includes("window"), false);
        }
      }
    }
  });

  it("loads the CommonJS builds without a DOM", () => {
    const root = require("../dist/index.cjs");
    const react = require("../dist/react.cjs");
    assert.equal(
      root.buildEmbedUrl({ map: "dow-30", theme: "light", live: true }),
      "https://247heatmap.com/embed/dow-30/light/?live=1",
    );
    const html = renderToString(
      React.createElement(react.Heatmap247, { map: "custom", tickers: "SPY,QQQ", attribution: false }),
    );
    assert.ok(html.includes('src="https://247heatmap.com/embed/custom/?t=SPY,QQQ"'));
    assert.equal(html.includes('href="https://247heatmap.com/"'), false);
    assert.equal(html.includes("Live market map by "), false);
  });
});
