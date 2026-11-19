// Single source of truth for the product name.
// To switch between "Travely" and "Joliday", change BRAND_NAME only
// (or set NEXT_PUBLIC_BRAND_NAME in .env.local). Nothing else is name-specific.
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Travely";

export const brand = {
  name: BRAND_NAME,
  promise: "Create the trip, invite your friends, and figure out the plan together.",
  /** Fake host used only for the mock invite link. */
  inviteHost: `${BRAND_NAME.toLowerCase()}.app`,
  /** Name written into the browser tab title. */
  documentTitle: `${BRAND_NAME}: plan trips with friends`,
} as const;
