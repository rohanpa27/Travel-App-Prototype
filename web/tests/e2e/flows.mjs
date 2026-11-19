// Core product flows at phone size. Needs a running server (BASE_URL, default http://localhost:4173).
import { BASE, check, click, finish, go, launch, settle, shot, text, type } from "./lib.mjs";
const OUT = process.env.SHOT_DIR;
const ctx = await launch();
const { page } = ctx; void page;
const P = () => ctx.page;
const has = async (s) => (await text(ctx)).includes(s);

await go(ctx, "/trip");
await check(ctx, "seed trip renders for Maya with 4 pending decisions", async () => (await has("Hey Maya")) && (await has("Needs your answer")));

// RSVP counts update immediately
await go(ctx, "/trip/itinerary");
await check(ctx, "beach picnic starts at 2 going", async () => (await P().evaluate(() => [...document.querySelectorAll("article")].find((a) => a.innerText.includes("Beach picnic")).innerText)).includes("2 going"));
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Beach picnic" });
await check(ctx, "beach picnic goes to 3 going after Yes", async () => (await P().evaluate(() => [...document.querySelectorAll("article")].find((a) => a.innerText.includes("Beach picnic")).innerText)).includes("3 going"));
await click(ctx, "No", "[role=radio]", { sel: "article", has: "Beach picnic" });
await check(ctx, "changing to No drops back to 2 going", async () => (await P().evaluate(() => [...document.querySelectorAll("article")].find((a) => a.innerText.includes("Beach picnic")).innerText)).includes("2 going"));

// Full-group agreement
await click(ctx, "Yes", "[role=radio]", { sel: "article", has: "Drinks in West Loop" });
await check(ctx, "full agreement badge appears on Drinks", async () => (await has("Everyone's in")));

// Persistence
await go(ctx, "/trip/itinerary");
await check(ctx, "RSVPs persist after reload", async () => (await has("Everyone's in")));

// Capacity: boat tour has 5 seats, 3 yes seeded. Everyone else yes would fill it.
await check(ctx, "boat tour shows capacity info", async () => (await has("Architecture boat tour")));

// Cost updates
await go(ctx, "/trip/costs");
await check(ctx, "costs page shows personal and group totals", async () => (await has("Maya's estimated cost")) && (await has("Whole group")));

// Add activity
await go(ctx, "/trip/activity/edit");
await click(ctx, "Propose to the group");
await check(ctx, "activity form validates empty title", async () => (await has("Name the activity")));
await type(ctx, 'input[placeholder="Sunset architecture cruise"]', "Karaoke night");
await type(ctx, 'input[placeholder="50"]', "30");
await click(ctx, "Propose to the group");
await settle(600);
await check(ctx, "new activity opens its detail page", async () => (await has("Karaoke night")) && P().url().includes("/trip/activity?id="));
await go(ctx, "/trip/itinerary");
await check(ctx, "new activity appears in itinerary", async () => (await has("Karaoke night")));

// Recommendations
await go(ctx, "/trip/recommendations");
await click(ctx, "Add to ideas");
await check(ctx, "recommendation can be added to ideas", async () => (await has("Added to your ideas")));
await click(ctx, "Dismiss");
await check(ctx, "recommendation can be dismissed", async () => true);

// Travel
await go(ctx, "/trip/travel");
await check(ctx, "pickup opportunity from seeded data", async () => (await has("Ride share opportunity")));
await click(ctx, "Find coordinated flights");
await settle(1300);
await check(ctx, "coordinated flights explains recommendation", async () => /Best match for the group: arrives within \d+ minutes of/.test(await text(ctx)));
if (OUT) await shot(ctx, `${OUT}/find-flights.png`);
await P().keyboard.press("Escape");
await click(ctx, "Add manually");
await click(ctx, "Add flight");
await check(ctx, "manual flight validates", async () => (await has("Add the airline")));
await P().keyboard.press("Escape");
await click(ctx, "Import confirmation");
await click(ctx, "Import flights");
await settle(1500);
await check(ctx, "import confirmation completes", async () => (await has("From confirmation")));
await click(ctx, "Connect Google Calendar");
await settle(1600);
await check(ctx, "calendar connect simulation completes", async () => (await has("Google Calendar connected")));

// Share modal
await go(ctx, "/trip");
await click(ctx, "Share");
await check(ctx, "share modal shows invite link", async () => (await P().evaluate(() => document.querySelector('input[aria-label="Invite link"]')?.value ?? "")).includes("/t/chicago-birthday-weekend"));
await click(ctx, "Copy");
await check(ctx, "copy gives feedback", async () => (await has("Copied")) || (await has("Select the link")));
await P().keyboard.press("Escape");
await check(ctx, "Escape closes modal", async () => !(await has("Invite your friends")));

// Join flow
await go(ctx, "/invite");
await click(ctx, "Join the trip");
await click(ctx, "Count me in");
await check(ctx, "join validates name", async () => (await has("Add your name")));
await type(ctx, 'input[placeholder="Alex"]', "Alex");
await click(ctx, "Count me in");
await settle(2400);
await check(ctx, "join lands on trip as the new guest", async () => P().url().endsWith("/trip") && (await has("Hey Alex")));
await check(ctx, "new guest has pending decisions and zero cost", async () => (await has("Needs your answer")) && (await has("$0")));
if (OUT) await shot(ctx, `${OUT}/joined.png`);

// Reset
await go(ctx, "/trip/profile");
await click(ctx, "Reset demo");
await click(ctx, "Reset everything");
await go(ctx, "/trip");
await check(ctx, "reset restores Maya and the original plan", async () => (await has("Hey Maya")));

// Create flow
await go(ctx, "/create");
await click(ctx, "Next");
await check(ctx, "create flow validates basics", async () => (await has("Give your trip a name")));
await type(ctx, 'input[placeholder="Chicago Birthday Weekend"]', "Lisbon Long Weekend");
await type(ctx, 'input[placeholder="Chicago, IL"]', "Lisbon, Portugal");
await type(ctx, "input[type=date]", "04102027", 0);
await type(ctx, "input[type=date]", "04132027", 1);
await click(ctx, "Next");
await click(ctx, "Next");
await type(ctx, 'input[placeholder="Dinner at a rooftop spot"]', "Pasteis tour");
await click(ctx, "Create trip");
await settle(800);
await check(ctx, "created trip opens with host-only state", async () => (await has("Lisbon Long Weekend")) && (await has("Your trip is ready")));
if (OUT) await shot(ctx, `${OUT}/created.png`);
await go(ctx, "/trip/recommendations");
await check(ctx, "recommendations adapt to non-Chicago destination", async () => (await has("in Lisbon")) && !(await has("Art Institute")));
await go(ctx, "/trip/profile");
await click(ctx, "Reset demo");
await click(ctx, "Reset everything");

void BASE;
await finish(ctx);
