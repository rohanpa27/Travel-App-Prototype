// Storage failures, legacy data, extreme text, keyboard use, and focus handling.
import { check, click, finish, go, launch, settle, text, type } from "./lib.mjs";
const KEY = "trip-prototype:v1";
const ctx = await launch();
const has = async (s) => (await text(ctx)).includes(s);
const overflow = () => ctx.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const active = () => ctx.page.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName}|${e.getAttribute("aria-label") || e.innerText?.slice(0, 40) || ""}|${e.closest('[role=dialog]') ? "dialog" : "page"}` : ""; });

// 1. Corrupted storage falls back to the seed
await go(ctx, "/");
await ctx.page.evaluate((k) => localStorage.setItem(k, "{not json"), KEY);
await go(ctx, "/trip");
await check(ctx, "corrupted storage falls back to the starter trip", async () => (await has("Hey Maya")));
await ctx.page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ version: 2, activeId: "ghost", trips: {} })), KEY);
await go(ctx, "/trip");
await check(ctx, "structurally wrong storage falls back too", async () => (await has("Hey Maya")));

// 2. Legacy single-trip data from the first prototype version is kept
await ctx.page.evaluate((k) => localStorage.removeItem(k), KEY);
await go(ctx, "/trip/itinerary");
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Beach picnic" }); // forces a save in the current format
await ctx.page.evaluate((k) => {
  const root = JSON.parse(localStorage.getItem(k));
  const chicago = root.trips["trip-chicago"] ?? Object.values(root.trips)[0];
  chicago.trip.title = "Legacy Chicago Title";
  localStorage.setItem(k, JSON.stringify(chicago)); // old format: one AppState, version 1
}, KEY);
await go(ctx, "/trip");
await check(ctx, "first-version saved data migrates without loss", async () => (await has("Legacy Chicago Title")) && (await has("Hey Maya")));
await go(ctx, "/trip/itinerary");
await check(ctx, "migrated data keeps the person's own RSVP", async () => (await ctx.page.evaluate(() => [...document.querySelectorAll("article")].find((a) => a.innerText.includes("Beach picnic")).innerText)).includes("3 going"));
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Hotel check-in" });
await check(ctx, "after migration the next save uses the new format", async () => ctx.page.evaluate((k) => JSON.parse(localStorage.getItem(k)).version === 2, KEY));
await go(ctx, "/trip/profile");
await click(ctx, "Reset demo");
await click(ctx, "Reset everything");

// 3. Blocked storage: the app still works for the session
await ctx.page.evaluateOnNewDocument(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
await go(ctx, "/trip/itinerary");
await check(ctx, "page renders when storage throws", async () => (await has("Itinerary")) && (await has("Beach picnic")));
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Beach picnic" });
await check(ctx, "RSVP still works in-session when storage is blocked", async () => (await ctx.page.evaluate(() => [...document.querySelectorAll("article")].find((a) => a.innerText.includes("Beach picnic")).innerText)).includes("3 going"));

// 4. Extreme text does not break layout
await ctx.browser.close();
const ctx2 = await launch();
Object.assign(ctx, ctx2);
const long = "Supercalifragilisticexpialidocious".repeat(2);
await go(ctx, "/create");
await type(ctx, 'input[placeholder="Chicago Birthday Weekend"]', long.slice(0, 60));
await type(ctx, 'input[placeholder="Chicago, IL"]', "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch");
await type(ctx, "input[type=date]", "06012027", 0);
await type(ctx, "input[type=date]", "06042027", 1);
await click(ctx, "Next"); await click(ctx, "Next");
await type(ctx, 'input[placeholder="Dinner at a rooftop spot"]', "Wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
await click(ctx, "Create trip");
await settle(900);
for (const path of ["/trip", "/trip/itinerary", "/trip/guests", "/trip/costs", "/trip/travel", "/trip/recommendations", "/trip/more"]) {
  await go(ctx, path);
  await check(ctx, `no horizontal overflow with very long names on ${path} (${await overflow()}px)`, async () => (await overflow()) <= 0);
}
await go(ctx, "/invite");
await check(ctx, "no horizontal overflow on the invitation with a very long title", async () => (await overflow()) <= 0);

// 5. Keyboard: visible focus ring and dialog focus handling
await go(ctx, "/trip/itinerary");
await ctx.page.keyboard.press("Tab");
await ctx.page.keyboard.press("Tab");
await check(ctx, "keyboard focus shows a visible outline", async () => ctx.page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return e !== document.body && c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2; }));
await go(ctx, "/trip");
await click(ctx, "Share");
await check(ctx, "dialog takes focus when it opens", async () => (await active()).endsWith("dialog"));
for (let i = 0; i < 12; i++) await ctx.page.keyboard.press("Tab");
await check(ctx, "Tab stays trapped inside the dialog", async () => (await active()).endsWith("dialog"));
await ctx.page.keyboard.down("Shift");
for (let i = 0; i < 12; i++) await ctx.page.keyboard.press("Tab");
await ctx.page.keyboard.up("Shift");
await check(ctx, "Shift+Tab also stays inside", async () => (await active()).endsWith("dialog"));
await ctx.page.keyboard.press("Escape");
await settle(300);
await check(ctx, "closing returns focus to the Share button", async () => (await active()).startsWith("BUTTON|Share"));

// 6. Typing in a modal field keeps focus (regression test for the focus-stealing bug)
await go(ctx, "/invite");
await click(ctx, "Join the trip");
await type(ctx, 'input[placeholder="Alex"]', "Jamie");
await check(ctx, "name field keeps every typed character", async () => (await ctx.page.evaluate(() => document.querySelector('input[placeholder="Alex"]').value)) === "Jamie");

await finish(ctx);
