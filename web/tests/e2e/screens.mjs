// Saves full-page screenshots of every screen to SHOT_DIR for visual review. Not a pass/fail test.
import { click, go, launch, type } from "./lib.mjs";
const OUT = process.env.SHOT_DIR ?? "/tmp";
const shots = async (ctx, name) => { try { await ctx.page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); console.log("saved", name); } catch (e) { console.log("skip", name, e.message.split("\n")[0]); } };
const ctx = await launch({ mobile: true });
for (const [name, path] of [["landing", "/"], ["invite", "/invite"], ["home", "/trip"], ["itinerary", "/trip/itinerary"], ["activity", "/trip/activity?id=a-boat"], ["add", "/trip/activity/edit"], ["guests", "/trip/guests"], ["costs", "/trip/costs"], ["travel", "/trip/travel"], ["recs", "/trip/recommendations"], ["more", "/trip/more"], ["profile", "/trip/profile"], ["create1", "/create"]]) {
  await go(ctx, path);
  await shots(ctx, name);
}
await go(ctx, "/invite"); await click(ctx, "Join the trip"); await shots(ctx, "join");
await go(ctx, "/create"); await type(ctx, 'input[placeholder="Chicago Birthday Weekend"]', "Test"); await type(ctx, 'input[placeholder="Chicago, IL"]', "Rome"); await type(ctx, "input[type=date]", "06012027", 0); await type(ctx, "input[type=date]", "06032027", 1); await click(ctx, "Next"); await shots(ctx, "create2"); await click(ctx, "Next"); await shots(ctx, "create3");
for (const label of ["aspen", "lisbon", "austin"]) {
  await go(ctx, "/trip");
  await click(ctx, "Switch trip", "button");
  await click(ctx, label === "aspen" ? "Aspen Ski Weekend" : label === "lisbon" ? "Lisbon Bachelorette Weekend" : "Austin Live Music Weekend", "button");
  await go(ctx, "/trip");
  await shots(ctx, `${label}-home`);
  await go(ctx, "/trip/travel");
  await shots(ctx, `${label}-travel`);
}
await ctx.browser.close();
process.exit(0);
