// Tiny browser test harness on top of puppeteer-core and the locally installed Chrome.
import puppeteer from "puppeteer-core";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const BASE = process.env.BASE_URL ?? "http://localhost:4173";
// Prefers the project-local chrome-headless-shell (installed into ../.tools/browsers); override with CHROME_PATH.
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".tools", "browsers", "chrome-headless-shell");
  if (existsSync(root)) {
    for (const v of readdirSync(root).filter((n) => !n.startsWith("."))) for (const d of readdirSync(join(root, v)).filter((n) => !n.startsWith("."))) {
      const bin = join(root, v, d, "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}
const CHROME = findChrome();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 390, height = 844, mobile = true, reducedMotion = false } = {}) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "shell", pipe: true, protocolTimeout: 20000, args: ["--in-process-gpu", "--disable-dev-shm-usage", "--no-first-run", "--disable-features=Translate,BackForwardCache"] });
  const ctx = { browser, page: null, errors: [], results: [], width, height, mobile, reducedMotion };
  await fresh(ctx);
  return ctx;
}

/** A fresh tab per navigation avoids stale frames; localStorage is shared across tabs in a context. */
export async function fresh(ctx) {
  if (ctx.page) await ctx.page.close().catch(() => {});
  const page = await ctx.browser.newPage();
  await page.setViewport({ width: ctx.width, height: ctx.height, isMobile: ctx.mobile, hasTouch: ctx.mobile, deviceScaleFactor: 2 });
  if (ctx.reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  page.on("pageerror", (e) => ctx.errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.text())) ctx.errors.push(`console: ${m.text()}`); });
  ctx.page = page;
}

export async function go(ctx, path) {
  await fresh(ctx);
  await ctx.page.goto(BASE + path, { waitUntil: "networkidle0" });
  await sleep(700);
}

export const text = (ctx) => ctx.page.evaluate(() => document.body.innerText);
export const settle = (ms = 450) => sleep(ms);

// Element handles stall in headless-shell 158, so every DOM action runs inside page.evaluate.
export async function click(ctx, label, selector = "button,a,[role=radio]", within) {
  const found = await ctx.page.evaluate(
    (label, selector, within) => {
      const root = within ? [...document.querySelectorAll(within.sel)].find((e) => e.innerText.includes(within.has)) : document;
      const all = root ? [...root.querySelectorAll(selector)] : [];
      // Prefer an exact label, then fall back to "starts with", so "Add flight" beats "Add flight for Sofia".
      const el = all.find((e) => (e.innerText || "").trim() === label || e.getAttribute("aria-label") === label) ?? all.find((e) => (e.innerText || "").trim().startsWith(label) || (e.getAttribute("aria-label") || "").startsWith(label));
      if (!el) return false;
      el.scrollIntoView({ block: "center" });
      el.focus(); // a real click focuses the control; DOM click() alone does not
      el.click();
      return true;
    },
    label, selector, within,
  );
  if (!found) throw new Error(`Nothing to click: "${label}"${within ? ` in "${within.has}"` : ""}`);
  await sleep(450);
}

/** Focuses the nth element matching selector, then types like a keyboard. */
export async function type(ctx, selector, value, index = 0) {
  const ok = await ctx.page.evaluate((selector, index) => {
    const el = document.querySelectorAll(selector)[index];
    if (!el) return false;
    el.focus();
    return true;
  }, selector, index);
  if (!ok) throw new Error(`Nothing to type into: ${selector}`);
  await ctx.page.keyboard.type(value);
}

export async function check(ctx, name, fn) {
  try {
    const ok = await fn();
    ctx.results.push({ name, ok: !!ok });
    console.log(ok ? "PASS" : "FAIL", name);
  } catch (e) {
    ctx.results.push({ name, ok: false });
    console.log("FAIL", name, "-", e.message.split("\n")[0]);
  }
}

export async function shot(ctx, file) {
  try {
    await ctx.page.screenshot({ path: file });
  } catch (e) {
    console.log("  (screenshot skipped:", e.message.split("\n")[0], ")");
  }
}

export async function finish(ctx) {
  const failed = ctx.results.filter((r) => !r.ok).length;
  console.log(`\n${ctx.results.length - failed}/${ctx.results.length} checks passed; page errors: ${ctx.errors.length}`);
  ctx.errors.slice(0, 8).forEach((e) => console.log("  ", e));
  await ctx.browser.close();
  process.exit(failed || ctx.errors.length ? 1 : 0);
}
