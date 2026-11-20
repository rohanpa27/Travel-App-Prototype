/** Where the site lives. Empty locally; "/Travel-App-Prototype" when hosted on GitHub Pages (set at build time). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a file in public/ (like /avatars/maya.svg) so plain <img> tags work under a base path. Saved data keeps the unprefixed path. */
export const asset = (path: string) => (path.startsWith("/") ? `${BASE_PATH}${path}` : path);
