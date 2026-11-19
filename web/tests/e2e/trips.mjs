// Multi-trip, permissions, overlap hints, and environment edge cases.
import { check, click, finish, go, launch, settle, shot, text, fresh } from "./lib.mjs";
const OUT = process.env.SHOT_DIR;
const ctx = await launch();
const has = async (s) => (await text(ctx)).includes(s);
const cardText = (title) => ctx.page.evaluate((t) => [...document.querySelectorAll("article")].find((a) => a.innerText.includes(t))?.innerText ?? "", title);

// Landing gallery
await go(ctx, "/");
const landing = await text(ctx);
await check(ctx, "landing lists every demo title", async () => ["Chicago Birthday Weekend", "Aspen Ski Weekend", "Lisbon Bachelorette Weekend", "Austin Live Music Weekend"].every((t) => landing.includes(t)));
if (OUT) await shot(ctx, `${OUT}/landing-bottom.png`);

// Open Aspen from the gallery
await click(ctx, "Aspen Ski Weekend", "button");
await settle(900);
await check(ctx, "gallery opens Aspen as its host", async () => ctx.page.url().endsWith("/trip") && (await has("Hey Dev")) && (await has("Aspen, CO")));

// Make a change in Aspen
await go(ctx, "/trip/itinerary");
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Snowshoe through the aspens" });
await check(ctx, "Aspen RSVP counted", async () => (await cardText("Snowshoe through the aspens")).includes("3 going"));

// Switch to Chicago via the header switcher
await click(ctx, "Switch trip. Open now: Aspen Ski Weekend");
await check(ctx, "switcher lists open trips and unopened demos", async () => (await has("Your trips")) && (await has("More demo trips")) && (await has("Lisbon Bachelorette Weekend")));
if (OUT) await shot(ctx, `${OUT}/switcher.png`);
await click(ctx, "Chicago Birthday Weekend", "button");
await settle(900);
await check(ctx, "switching opens Chicago untouched", async () => (await has("Hey Maya")) && (await has("Chicago, IL")));
await go(ctx, "/trip/itinerary");
await check(ctx, "Chicago picnic still 2 going (changes are per trip)", async () => (await cardText("Beach picnic")).includes("2 going"));

// Persist across reload and switching back
await go(ctx, "/trip/itinerary");
await check(ctx, "reload keeps the open trip", async () => (await has("Beach picnic")));
await click(ctx, "Switch trip. Open now: Chicago Birthday Weekend");
await click(ctx, "Aspen Ski Weekend", "button");
await settle(900);
await go(ctx, "/trip/itinerary");
await check(ctx, "Aspen change persisted after switching away and back", async () => (await cardText("Snowshoe through the aspens")).includes("3 going"));

// Lisbon overlap hint
await click(ctx, "Switch trip. Open now: Aspen Ski Weekend");
await click(ctx, "Lisbon Bachelorette Weekend", "button");
await settle(900);
await go(ctx, "/trip/itinerary");
await check(ctx, "Lisbon shows the overlapping plans hint", async () => (await cardText("Sintra day trip")).includes("Overlaps with Tile painting workshop"));
if (OUT) await shot(ctx, `${OUT}/lisbon-itinerary.png`);
await check(ctx, "day jump chips exist on phone", async () => ctx.page.evaluate(() => !!document.querySelector('nav[aria-label="Jump to a day"]') && getComputedStyle(document.querySelector('nav[aria-label="Jump to a day"]')).display !== "none"));

// Austin travel
await click(ctx, "Switch trip. Open now: Lisbon Bachelorette Weekend");
await click(ctx, "Austin Live Music Weekend", "button");
await settle(900);
await go(ctx, "/trip/travel");
await check(ctx, "Austin travel shows arrivals and a ride share", async () => (await has("Ride share opportunity")) && (await has("Needs import")));
await go(ctx, "/trip/costs");
await check(ctx, "Austin costs exclude the free activity but show totals", async () => (await has("Whole group")) && !(await has("Record store crawl")));

// Permissions: view as Noah in Chicago, cannot edit Jordan's drinks or confirm
await click(ctx, "Switch trip. Open now: Austin Live Music Weekend");
await click(ctx, "Chicago Birthday Weekend", "button");
await settle(900);
await go(ctx, "/trip/profile");
await click(ctx, "Noah", "button");
await go(ctx, "/trip/activity?id=a-drinks");
await check(ctx, "non-creator member sees no Edit or Confirm", async () => !(await has("Confirm for the group")) && !(await ctx.page.evaluate(() => [...document.querySelectorAll("a")].some((a) => a.innerText.trim() === "Edit"))));
await go(ctx, "/trip/activity/edit?id=a-drinks");
await check(ctx, "edit page blocks non-creator", async () => (await has("Only the organizer or the person who suggested this can edit it")));
await go(ctx, "/trip/profile");
await click(ctx, "Maya", "button");
await go(ctx, "/trip/activity?id=a-drinks");
await check(ctx, "organizer can edit and confirm", async () => (await has("Confirm for the group")));
await click(ctx, "Confirm for the group");
await check(ctx, "confirming flips status", async () => (await has("Confirmed")));

// Created trips are separate and removable
await go(ctx, "/create");
await click(ctx, "Next");
await type_(ctx, 'input[placeholder="Chicago Birthday Weekend"]', "Denver Day Out");
await type_(ctx, 'input[placeholder="Chicago, IL"]', "Denver, CO");
await type_(ctx, "input[type=date]", "06052027", 0);
await type_(ctx, "input[type=date]", "06052027", 1);
await click(ctx, "Next");
await click(ctx, "Next");
await click(ctx, "Create trip");
await settle(800);
await check(ctx, "single-day trip creates fine", async () => (await has("Denver Day Out")) && (await has("Your trip is ready")));
await go(ctx, "/trip/itinerary");
await check(ctx, "single-day itinerary renders one day", async () => (await has("Sat, Jun 5")) && !(await has("Sun, Jun 6")));
await click(ctx, "Switch trip. Open now: Denver Day Out");
await check(ctx, "created trip appears with a remove button next to the demos", async () => (await has("Denver Day Out")) && (await has("Chicago Birthday Weekend")) && (await ctx.page.evaluate(() => !!document.querySelector('[aria-label="Remove Denver Day Out"]'))));
await click(ctx, "Remove Denver Day Out");
await check(ctx, "removing the open trip falls back to Chicago", async () => !(await ctx.page.evaluate(() => !!document.querySelector('[aria-label="Remove Denver Day Out"]'))) && (await ctx.page.evaluate(() => document.querySelector('[aria-current="true"]')?.innerText.includes("Chicago Birthday Weekend") ?? false)));
await ctx.page.keyboard.press("Escape");

// Clipboard failure fallback
await ctx.page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("blocked")) }, configurable: true }); });
await go(ctx, "/trip");
await click(ctx, "Share");
await click(ctx, "Copy");
await check(ctx, "blocked clipboard falls back to a selectable link", async () => (await has("Select the link and copy it")));
await ctx.page.keyboard.press("Escape");

// 404 (the browser logs a console error for the missing page itself, which is expected)
const before = ctx.errors.length;
await go(ctx, "/definitely-not-here");
await check(ctx, "unknown route shows the friendly 404", async () => (await has("isn't on the itinerary")));
ctx.errors.splice(before);
await go(ctx, "/trip/activity?id=nope");
await check(ctx, "unknown activity id shows an empty state", async () => (await has("We can't find that activity")));

// Reset brings everything back
await go(ctx, "/trip/profile");
await click(ctx, "Reset demo");
await click(ctx, "Reset everything");
await go(ctx, "/trip");
await click(ctx, "Switch trip. Open now: Chicago Birthday Weekend");
await check(ctx, "reset restores every demo to unopened", async () => (await has("More demo trips")) && (await has("Aspen Ski Weekend")) && !(await ctx.page.evaluate(() => !!document.querySelector('[aria-label^="Remove"]'))));
await ctx.page.keyboard.press("Escape");

// Reduced motion
ctx.reducedMotion = true;
await fresh(ctx);
await go(ctx, "/");
await check(ctx, "reduced motion disables animations", async () => ctx.page.evaluate(() => { const el = document.querySelector(".wobble"); return !el || parseFloat(getComputedStyle(el).animationDuration) < 0.01; }));
ctx.reducedMotion = false;

// Desktop layout
ctx.width = 1280; ctx.height = 900; ctx.mobile = false;
await go(ctx, "/trip");
await check(ctx, "desktop shows side navigation and no bottom bar", async () => ctx.page.evaluate(() => {
  const side = document.querySelector("aside nav"); const bottom = document.querySelector('nav.fixed');
  return !!side && getComputedStyle(side.parentElement).display !== "none" && (!bottom || getComputedStyle(bottom).display === "none");
}));
await check(ctx, "desktop nav has Overview, Itinerary, Guests, Costs, Travel", async () => ["Overview", "Itinerary", "Guests", "Costs", "Travel"].every((l) => ctx.page.evaluate((l) => [...document.querySelectorAll("aside nav a")].some((a) => a.innerText.trim() === l), l)) );
if (OUT) await shot(ctx, `${OUT}/desktop-trip.png`);
await go(ctx, "/trip/itinerary");
if (OUT) await shot(ctx, `${OUT}/desktop-itinerary.png`);

async function type_(c, sel, v, i = 0) {
  await c.page.evaluate((sel, i) => document.querySelectorAll(sel)[i].focus(), sel, i);
  await c.page.keyboard.type(v);
}
await finish(ctx);
