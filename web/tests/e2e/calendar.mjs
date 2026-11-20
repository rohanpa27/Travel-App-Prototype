// The calendar: month grid, day schedule, overlaps, adding to a day, exporting, and the Joliday name.
import { check, click, finish, go, launch, settle, text, type } from "./lib.mjs";
const ctx = await launch();
const has = async (s) => (await text(ctx)).includes(s);
const cell = (day) => ctx.page.evaluate((day) => [...document.querySelectorAll("section[aria-label] button")].find((b) => b.textContent.trim().startsWith(day))?.textContent.replace(/\s+/g, " ").trim() ?? "", day);

// Name
await go(ctx, "/");
await check(ctx, "the product is called Joliday", async () => (await has("Joliday")) && !(await has("Travely")) && (await ctx.page.title()).startsWith("Joliday"));

// Reach the calendar from the itinerary
await go(ctx, "/trip/itinerary");
await click(ctx, "Calendar", "a");
await settle(600);
await check(ctx, "itinerary links to the calendar and back", async () => ctx.page.url().endsWith("/trip/calendar") && (await has("March 2027")) && (await ctx.page.evaluate(() => !!document.querySelector('nav[aria-label="Itinerary view"] a[href$="/trip/itinerary"]'))));

// Month grid shows plan counts for trip days only
await check(ctx, "trip days show plan counts", async () => (await cell("14")).includes("2 plans") && (await cell("15")).includes("3 plans") && (await cell("16")).includes("1 plan"));
await check(ctx, "days outside the trip cannot be picked", async () => ctx.page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.innerText.trim() === "20"); return !b || b.disabled; }));
await check(ctx, "the first trip day is open by default", async () => (await has("Sun, Mar 14")) && (await has("Hotel check-in")));

// Choose another day
await click(ctx, "15", "section[aria-label] button");
await check(ctx, "choosing a day shows its schedule", async () => (await has("Mon, Mar 15")) && (await has("Architecture boat tour")) && (await has("Birthday dinner")));
await check(ctx, "the chosen day is marked pressed", async () => ctx.page.evaluate(() => [...document.querySelectorAll("section[aria-label] button")].find((b) => b.textContent.trim().startsWith("15")).getAttribute("aria-pressed") === "true"));
await click(ctx, "Architecture boat tour", "a");
await settle(500);
await check(ctx, "a schedule block opens the activity", async () => ctx.page.url().includes("/trip/activity?id=a-boat"));
await check(ctx, "the activity can be saved to a calendar app", async () => (await has("Add to my calendar")));
await click(ctx, "Add to my calendar");
await check(ctx, "saving to a calendar app confirms", async () => (await has("saved for your calendar app")));

// Add to a day pre-fills the date
await go(ctx, "/trip/calendar?day=2027-03-16");
await check(ctx, "a day link opens that day", async () => has("Tue, Mar 16"));
await click(ctx, "Add to this day");
await settle(500);
await check(ctx, "adding from a day pre-fills its date", async () => ctx.page.evaluate(() => document.querySelector("input[type=date]").value === "2027-03-16"));

// Overview strip
await go(ctx, "/trip");
await check(ctx, "overview shows the trip at a glance", async () => (await has("Trip at a glance")) && (await has("3 plans")));
await ctx.page.evaluate(() => document.querySelector('a[href*="calendar?day=2027-03-15"]').click());
await settle(700);
await check(ctx, "a strip day opens the calendar on that day", async () => ctx.page.url().includes("/trip/calendar?day=2027-03-15") && (await has("Mon, Mar 15")));

// Export
await go(ctx, "/trip/calendar");
await click(ctx, "Add confirmed plans to my calendar");
await check(ctx, "exporting reports how many events were saved", async () => /Saved \d+ events? for your calendar app/.test(await text(ctx)));

// Overlaps: Lisbon has two plans on the same morning
await go(ctx, "/trip");
await click(ctx, "Switch trip. Open now: Chicago Birthday Weekend");
await click(ctx, "Lisbon Bachelorette Weekend", "button");
await settle(900);
await go(ctx, "/trip/calendar?day=2027-05-22");
await check(ctx, "Lisbon's busy day is flagged in the grid", async () => (await cell("22")).includes("some overlap"));
await check(ctx, "overlapping plans sit side by side and are flagged", async () => ctx.page.evaluate(() => {
  const els = [...document.querySelectorAll('a[data-overlap="true"]')];
  if (els.length < 2) return false;
  const [a, b] = els.map((e) => e.getBoundingClientRect());
  return a.right <= b.left + 4 || b.right <= a.left + 4;
}));

// A trip across two months gets two grids
await go(ctx, "/create");
await type(ctx, 'input[placeholder="Chicago Birthday Weekend"]', "Long Weekend");
await type(ctx, 'input[placeholder="Chicago, IL"]', "Denver, CO");
await type(ctx, "input[type=date]", "03302027", 0);
await type(ctx, "input[type=date]", "04022027", 1);
await click(ctx, "Next");
await click(ctx, "Next");
await click(ctx, "Create trip");
await settle(900);
await go(ctx, "/trip/calendar");
await check(ctx, "a trip across a month end shows both months", async () => (await has("March 2027")) && (await has("April 2027")));
await check(ctx, "an empty trip day says so", async () => has("A free day"));

await finish(ctx);
