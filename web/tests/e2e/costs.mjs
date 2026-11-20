// Costs are optional: an activity needs no price, and a trip can hide money everywhere.
import { check, click, finish, go, launch, settle, text, type } from "./lib.mjs";
const ctx = await launch();
const has = async (s) => (await text(ctx)).includes(s);
const switchState = () => ctx.page.evaluate(() => document.querySelector('[role=switch]')?.getAttribute("aria-checked") ?? "missing");
const flip = async () => { await ctx.page.evaluate(() => document.querySelector("[role=switch]").click()); await settle(500); };
const dollars = async () => /\$\d/.test(await text(ctx));

// 1. With costs on, a price is not required to propose an activity.
await go(ctx, "/trip/activity/edit");
await type(ctx, 'input[placeholder="Sunset architecture cruise"]', "Lakefront walk");
await check(ctx, "cost field is marked optional", async () => has("Cost per person ($, optional)"));
await click(ctx, "Propose to the group");
await settle(600);
await check(ctx, "an activity with no cost can be proposed", async () => (await has("Lakefront walk")) && ctx.page.url().includes("/trip/activity?id="));
await check(ctx, "its detail says the cost is not set", async () => has("Not set"));

// 2. The organizer turns costs off in Profile.
await go(ctx, "/trip/profile");
await check(ctx, "costs switch starts on for the demo", async () => (await switchState()) === "true");
await flip();
await check(ctx, "organizer can turn costs off", async () => (await switchState()) === "false");

await go(ctx, "/trip");
await check(ctx, "overview hides the cost summary", async () => !(await has("estimated cost")) && !(await has("cost breakdown")) && !(await dollars()));
await go(ctx, "/trip/itinerary");
await check(ctx, "itinerary shows no prices", async () => !(await dollars()) && !/\d each\b/.test(await text(ctx)));
await go(ctx, "/trip/guests");
await check(ctx, "guests shows no cost column", async () => !(await has("Est. cost")));
await go(ctx, "/trip/more");
await check(ctx, "More has no Costs link", async () => !(await ctx.page.evaluate(() => [...document.querySelectorAll("a")].some((a) => a.innerText.includes("Costs")))));
await go(ctx, "/trip/costs");
await check(ctx, "costs page explains it is off and offers to turn it on", async () => (await has("Costs are turned off for this trip")) && (await has("Turn costs on")));
await go(ctx, "/trip/recommendations");
await check(ctx, "suggestions show no prices or budget talk", async () => !(await dollars()) && !(await has("your budget")) && !(await has("activity budget")));
await go(ctx, "/trip/activity?id=a-boat");
await check(ctx, "activity detail hides cost and payment", async () => (await has("Architecture boat tour")) && !(await has("Cost per person")) && !(await has("Mark as paid")));

// 3. Planning with no money: propose without any cost field at all.
await go(ctx, "/trip/activity/edit");
await check(ctx, "form has no cost field when off", async () => !(await has("Cost per person")));
await type(ctx, 'input[placeholder="Sunset architecture cruise"]', "Board game night");
await click(ctx, "Propose to the group");
await settle(600);
await check(ctx, "an activity can be proposed with costs off", async () => (await has("Board game night")) && ctx.page.url().includes("/trip/activity?id="));

// 4. Editing keeps a saved price while costs are off.
await go(ctx, "/trip/activity?id=a-boat");
await click(ctx, "Edit", "a");
await settle(500);
await click(ctx, "Save changes");
await settle(600);

// 5. Turning back on restores everything, including prices saved before.
await go(ctx, "/trip/profile");
await flip();
await go(ctx, "/trip/costs");
await check(ctx, "turning costs on restores totals", async () => (await has("Whole group")) && (await has("Architecture boat tour")));
await go(ctx, "/trip/activity?id=a-boat");
await check(ctx, "saved price survived being hidden and edited", async () => (await has("Cost per person")) && !(await has("Not set")));

// 6. A friend cannot change it.
await go(ctx, "/trip/profile");
await click(ctx, "Jordan", "button[aria-pressed]");
await settle(400);
await check(ctx, "switch is disabled for a non-organizer", async () => ctx.page.evaluate(() => document.querySelector("[role=switch]").disabled === true));

// 7. A new trip can start with costs off.
await go(ctx, "/create");
await type(ctx, 'input[placeholder="Chicago Birthday Weekend"]', "Cabin Weekend");
await type(ctx, 'input[placeholder="Chicago, IL"]', "Asheville, NC");
await type(ctx, "input[type=date]", "05152027", 0);
await type(ctx, "input[type=date]", "05172027", 1);
await click(ctx, "Next");
await check(ctx, "create flow shows the budget field while costs are on", async () => has("Activity budget per person"));
await flip();
await check(ctx, "turning costs off hides the budget field", async () => !(await has("Activity budget per person")));
await click(ctx, "Next");
await check(ctx, "starter ideas have no price field", async () => !(await has("$ each")));
await type(ctx, 'input[placeholder="Dinner at a rooftop spot"]', "Hike to the falls");
await click(ctx, "Create trip");
await settle(900);
await check(ctx, "the new trip is created with no money anywhere", async () => (await has("Cabin Weekend")) && !(await has("estimated cost")) && !(await dollars()));
await go(ctx, "/trip/profile");
await check(ctx, "the new trip remembers costs are off", async () => (await switchState()) === "false");

await finish(ctx);
