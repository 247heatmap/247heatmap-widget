import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const demo = readFileSync(new URL("../examples/index.html", import.meta.url), "utf8");

function embedUrls(source) {
  return source.match(/https:\/\/247heatmap\.com\/embed\/[^\s)"'`<|]*/g) ?? [];
}

function isProductionEmbed(raw) {
  const bare = raw.replace(/[.,]+$/, "");
  if (bare === "https://247heatmap.com/embed/") return true;
  const url = new URL(bare);
  if (url.origin !== "https://247heatmap.com") return false;
  if (/^\/embed\/(?:sp500|nasdaq-100|dow-30)\/(?:dark|light)\/$/.test(url.pathname)) {
    return [...url.searchParams.keys()].every((key) => key === "live") && (url.search === "" || url.search === "?live=1");
  }
  if (url.pathname === "/embed/custom/") {
    for (const key of url.searchParams.keys()) {
      if (!["t", "m", "s", "live"].includes(key)) return false;
    }
    const metric = url.searchParams.get("m");
    const size = url.searchParams.get("s");
    const live = url.searchParams.get("live");
    if (metric && metric !== "24h" && metric !== "1h") return false;
    if (size && size !== "equal") return false;
    if (live && live !== "1") return false;
    return true;
  }
  return false;
}

describe("README embed URLs", () => {
  it("only links iframe routes that exist in production", () => {
    const urls = [...embedUrls(readme), ...embedUrls(demo)];
    assert.ok(urls.length >= 8, `expected several embed URLs, found ${urls.length}`);
    for (const url of urls) {
      assert.ok(isProductionEmbed(url), `unexpected embed URL: ${url}`);
    }
  });

  it("shows the attribution line and the off switch", () => {
    assert.match(readme, /Live market map by/);
    assert.match(readme, /attribution="false"/);
    assert.match(readme, /attribution=\{false\}/);
  });

  it("links the configurator, custom builder, walkthrough, and live site", () => {
    assert.match(readme, /https:\/\/247heatmap\.com\/embed\//);
    assert.match(readme, /https:\/\/247heatmap\.com\/custom\//);
    assert.match(readme, /https:\/\/youtu\.be\/7zjK4HleVu8/);
    assert.match(readme, /https:\/\/247heatmap\.com\//);
    assert.match(readme, /https:\/\/x\.com\/247heatmap/);
    assert.match(readme, /https:\/\/www\.youtube\.com\/@247heatmap/);
    assert.match(readme, /assets\/01-homepage-heatmap\.png/);
    assert.match(readme, /assets\/04-custom-map\.png/);
  });
});
