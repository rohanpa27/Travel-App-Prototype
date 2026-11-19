// Runs axe-core (WCAG 2.1 A/AA rules) on every route at phone and desktop size, plus the open modals.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { click, go, launch } from "./lib.mjs";

const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const ROUTES = ["/", "/create", "/invite", "/trip", "/trip/itinerary", "/trip/activity?id=a-boat", "/trip/activity/edit", "/trip/guests", "/trip/costs", "/trip/travel", "/trip/recommendations", "/trip/more", "/trip/profile"];

async function audit(ctx) {
  await ctx.page.evaluate(axeSource);
  return ctx.page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ") + " :: " + (n.failureSummary || "").split("\n").slice(0, 3).join(" ").slice(0, 200)) }));
  });
}

const report = async (ctx, label) => {
  const v = await audit(ctx);
  total += 1;
  if (v.length) failed += 1;
  console.log(v.length ? "FAIL" : "PASS", `axe: ${label}`);
  for (const x of v) console.log(`    [${x.impact}] ${x.id}: ${x.help}\n      ${x.nodes.join("\n      ")}`);
};

let failed = 0;
let total = 0;
for (const [name, opts] of [["phone", { mobile: true }], ["desktop", { mobile: false, width: 1280, height: 900 }]]) {
  const ctx = await launch(opts);
  for (const r of ROUTES) {
    await go(ctx, r);
    await report(ctx, `${name} ${r}`);
  }
  await go(ctx, "/trip");
  await click(ctx, "Share");
  await report(ctx, `${name} share modal`);
  await go(ctx, "/trip");
  await click(ctx, "Switch trip. Open now: Chicago Birthday Weekend");
  await report(ctx, `${name} trip switcher`);
  await go(ctx, "/trip/travel");
  await click(ctx, "Find coordinated flights");
  await new Promise((r) => setTimeout(r, 1300));
  await report(ctx, `${name} coordinated flights modal`);
  await go(ctx, "/invite");
  await click(ctx, "Join the trip");
  await report(ctx, `${name} join modal`);
  await ctx.browser.close().catch(() => {});
}
console.log(`\n${total - failed}/${total} pages and dialogs have no axe violations`);
process.exit(failed ? 1 : 0);
