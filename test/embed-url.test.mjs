import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEmbedUrl,
  createEmbedFrame,
  normalizeTickers,
  showAttribution,
} from "../dist/index.js";

const INDEX = ["sp500", "nasdaq-100", "dow-30"];
const THEMES = ["dark", "light"];

describe("index embed URLs", () => {
  for (const map of INDEX) {
    for (const theme of THEMES) {
      it(`${map} ${theme}`, () => {
        const src = buildEmbedUrl({ map, theme });
        assert.equal(src, `https://247heatmap.com/embed/${map}/${theme}/`);
        const live = buildEmbedUrl({ map, theme, live: true });
        assert.equal(live, `https://247heatmap.com/embed/${map}/${theme}/?live=1`);
      });
    }
  }

  it("defaults to the S&P 500 dark map", () => {
    assert.equal(buildEmbedUrl(), "https://247heatmap.com/embed/sp500/dark/");
  });

  it("accepts the production mount aliases without inventing paths", () => {
    assert.equal(buildEmbedUrl({ map: "nasdaq100", theme: "light" }), "https://247heatmap.com/embed/nasdaq-100/light/");
    assert.equal(buildEmbedUrl({ map: "NDX" }), "https://247heatmap.com/embed/nasdaq-100/dark/");
    assert.equal(buildEmbedUrl({ map: "dow30", theme: "LIGHT" }), "https://247heatmap.com/embed/dow-30/light/");
    assert.equal(buildEmbedUrl({ map: "djia" }), "https://247heatmap.com/embed/dow-30/dark/");
    assert.equal(buildEmbedUrl({ map: "spx" }), "https://247heatmap.com/embed/sp500/dark/");
    assert.equal(buildEmbedUrl({ map: "S&P 500", theme: "light" }), "https://247heatmap.com/embed/sp500/light/");
  });

  it("falls unknown maps back to sp500 instead of a 404", () => {
    assert.equal(buildEmbedUrl({ map: "crypto", theme: "dark" }), "https://247heatmap.com/embed/sp500/dark/");
    assert.equal(buildEmbedUrl({ map: "russell-2000" }), "https://247heatmap.com/embed/sp500/dark/");
  });

  it("does not append tickers, metric, or size onto index routes", () => {
    assert.equal(
      buildEmbedUrl({ map: "sp500", theme: "dark", tickers: "AAPL,MSFT", metric: "24h", size: "equal" }),
      "https://247heatmap.com/embed/sp500/dark/",
    );
  });

  it("treats live flags the way the embed page documents them", () => {
    assert.equal(buildEmbedUrl({ live: "1" }), "https://247heatmap.com/embed/sp500/dark/?live=1");
    assert.equal(buildEmbedUrl({ live: "" }), "https://247heatmap.com/embed/sp500/dark/?live=1");
    assert.equal(buildEmbedUrl({ live: "false" }), "https://247heatmap.com/embed/sp500/dark/");
    assert.equal(buildEmbedUrl({ live: "0" }), "https://247heatmap.com/embed/sp500/dark/");
  });
});

describe("custom embed URLs", () => {
  it("uses /embed/custom/ and the production t, m, s, live query", () => {
    assert.equal(
      buildEmbedUrl({ map: "custom", tickers: "nvda, aapl, btc" }),
      "https://247heatmap.com/embed/custom/?t=NVDA,AAPL,BTC",
    );
    assert.equal(
      buildEmbedUrl({
        map: "custom",
        theme: "light",
        tickers: ["NVDA", "AAPL", "BTC"],
        metric: "24h",
        size: "equal",
        live: true,
      }),
      "https://247heatmap.com/embed/custom/?t=NVDA,AAPL,BTC&m=24h&s=equal&live=1",
    );
    assert.equal(
      buildEmbedUrl({ map: "custom", tickers: "ETH", metric: "1h" }),
      "https://247heatmap.com/embed/custom/?t=ETH&m=1h",
    );
  });

  it("never emits the 404 theme paths /embed/custom/dark/ or /embed/custom/light/", () => {
    for (const theme of THEMES) {
      const src = buildEmbedUrl({ map: "custom", theme, tickers: "SPY" });
      assert.equal(src, "https://247heatmap.com/embed/custom/?t=SPY");
      assert.equal(src.includes("/dark/"), false);
      assert.equal(src.includes("/light/"), false);
    }
  });

  it("omits default metric and size, matching the Embed this map button", () => {
    assert.equal(
      buildEmbedUrl({ map: "custom", tickers: "GOLD", metric: "close", size: "cap" }),
      "https://247heatmap.com/embed/custom/?t=GOLD",
    );
  });

  it("loads the hosted default preset when no tickers are passed", () => {
    assert.equal(buildEmbedUrl({ map: "custom" }), "https://247heatmap.com/embed/custom/");
    assert.equal(buildEmbedUrl({ map: "custom", live: true }), "https://247heatmap.com/embed/custom/?live=1");
  });

  it("cleans tickers the same way the custom page does", () => {
    assert.deepEqual(normalizeTickers(" brk.b, brk.b, $$$, eth "), ["BRK.B", "ETH"]);
    assert.equal(normalizeTickers("A".repeat(61)).length, 1);
    const many = Array.from({ length: 80 }, (_, i) => `S${i}`);
    assert.equal(normalizeTickers(many).length, 60);
    assert.equal(
      buildEmbedUrl({ map: "custom", tickers: "nvda aapl,msft" }),
      "https://247heatmap.com/embed/custom/?t=NVDA,AAPL,MSFT",
    );
  });
});

describe("attribution does not change the iframe URL", () => {
  const cases = [undefined, true, false, "false", "0", "no", "off", "true", ""];
  for (const map of [...INDEX, "custom"]) {
    for (const theme of THEMES) {
      for (const attribution of cases) {
        it(`${map} ${theme} attribution=${String(attribution)}`, () => {
          const withCredit = buildEmbedUrl({ map, theme, tickers: "AAPL", attribution });
          const plain = buildEmbedUrl({ map, theme, tickers: "AAPL" });
          assert.equal(withCredit, plain);
          const frame = createEmbedFrame({ map, theme, tickers: "AAPL", attribution });
          assert.equal(frame.src, plain);
          assert.equal(frame.showAttribution, showAttribution(attribution));
        });
      }
    }
  }

  it("defaults attribution on and accepts the documented off switch", () => {
    assert.equal(showAttribution(undefined), true);
    assert.equal(showAttribution(null), true);
    assert.equal(showAttribution(""), true);
    assert.equal(showAttribution("false"), false);
    assert.equal(showAttribution(false), false);
    assert.equal(createEmbedFrame({ attribution: "false" }).showAttribution, false);
  });
});

describe("frame chrome", () => {
  it("uses the production titles and canvas colors", () => {
    assert.equal(createEmbedFrame().title, "S&P 500 heat map — 24/7 Heatmap");
    assert.equal(createEmbedFrame({ map: "nasdaq-100" }).title, "Nasdaq-100 heat map — 24/7 Heatmap");
    assert.equal(createEmbedFrame({ map: "dow-30" }).title, "Dow 30 heat map — 24/7 Heatmap");
    assert.equal(createEmbedFrame({ map: "custom" }).title, "Custom stock heat map — 24/7 Heatmap");
    assert.equal(createEmbedFrame({ theme: "dark" }).background, "#101216");
    assert.equal(createEmbedFrame({ theme: "light" }).background, "#f4f6f8");
    assert.equal(createEmbedFrame({ map: "custom", theme: "light" }).background, "#101216");
    assert.equal(createEmbedFrame({ map: "custom", theme: "light" }).chromeTheme, "dark");
    assert.equal(createEmbedFrame({ height: 640, width: 800 }).height, "640px");
    assert.equal(createEmbedFrame({ height: "50vh", width: "100%" }).width, "100%");
  });
});
