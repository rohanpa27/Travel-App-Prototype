// Generates the original, locally bundled SVG art used by the prototype.
// Run with: npm run assets   (outputs to public/covers and public/avatars)
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(join(root, "covers"), { recursive: true });
mkdirSync(join(root, "avatars"), { recursive: true });

const W = 1200;
const H = 800;
const svg = (body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="${bg}"/>${body}</svg>`;

// Small seeded PRNG so the art is identical on every run.
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function buildings(seed, base, colors, count, minH, maxH) {
  const r = rng(seed);
  let x = -20;
  let out = "";
  for (let i = 0; i < count; i++) {
    const w = 70 + r() * 90;
    const h = minH + r() * (maxH - minH);
    const c = colors[Math.floor(r() * colors.length)];
    out += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${c}"/>`;
    if (r() > 0.55) out += `<rect x="${x + w / 2 - 4}" y="${base - h - 60}" width="8" height="60" fill="${c}"/>`;
    for (let wy = base - h + 22; wy < base - 20; wy += 34) {
      for (let wx = x + 14; wx < x + w - 18; wx += 26) {
        if (r() > 0.45) out += `<rect x="${wx}" y="${wy}" width="10" height="16" rx="2" fill="#FFE9A8" opacity="0.9"/>`;
      }
    }
    x += w + 6;
    if (x > W) break;
  }
  return out;
}

const covers = {
  "chicago-skyline": svg(
    `<circle cx="880" cy="250" r="130" fill="#FF8A5B"/>` +
      buildings(7, 560, ["#1B1A2E", "#2A2850", "#35316B"], 14, 160, 420) +
      `<rect y="560" width="${W}" height="240" fill="#2B59FF"/>` +
      [0, 1, 2, 3, 4].map((i) => `<rect x="${120 + i * 90}" y="${600 + i * 36}" width="${600 - i * 60}" height="10" rx="5" fill="#8FD3FF" opacity="0.8"/>`).join(""),
    "#FFC857",
  ),
  "sunset-beach": svg(
    `<circle cx="600" cy="420" r="190" fill="#FF5C45"/>` +
      `<rect y="470" width="${W}" height="330" fill="#1D8FE0"/>` +
      [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${350 + (i % 2) * 40}" y="${500 + i * 38}" width="${500 - i * 50}" height="12" rx="6" fill="#FFC857" opacity="0.85"/>`).join("") +
      `<path d="M0 700 Q300 640 600 700 T1200 700 V800 H0Z" fill="#F4D58D"/>`,
    "#FFB4A2",
  ),
  "alpine-weekend": svg(
    `<circle cx="300" cy="200" r="80" fill="#FFF3B0"/>` +
      `<path d="M-50 640 L260 260 L470 520 L700 180 L1000 600 L1250 380 V800 H-50Z" fill="#3D5A80"/>` +
      `<path d="M260 260 L215 322 L260 300 L300 330Z M700 180 L640 258 L700 236 L752 268Z" fill="#F7F7FF"/>` +
      `<path d="M-50 700 L300 520 L620 700 L900 560 L1250 720 V800 H-50Z" fill="#1C2541"/>`,
    "#B8E0F6",
  ),
  "festival-night": svg(
    `<circle cx="200" cy="140" r="60" fill="#FFF3B0"/>` +
      [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${100 + i * 170} 800 L${185 + i * 170} 330 L${270 + i * 170} 800Z" fill="${["#FF5C45", "#D4FF3F", "#8FD3FF", "#FFB020"][i % 4]}" opacity="0.92"/>`).join("") +
      [..."abcdefghijklmnopq"].map((_, i) => `<circle cx="${(i * 97) % W}" cy="${60 + ((i * 53) % 220)}" r="4" fill="#FFFFFF"/>`).join(""),
    "#1B1A2E",
  ),
  "city-after-dark": svg(
    `<circle cx="1000" cy="170" r="70" fill="#F7F7FF"/>` +
      buildings(21, 640, ["#0F0E1A", "#1B1A2E", "#2A2850"], 16, 200, 520) +
      `<rect y="640" width="${W}" height="160" fill="#0B0A14"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${60 + i * 150}" y="700" width="90" height="8" rx="4" fill="${["#FF5C45", "#D4FF3F", "#8FD3FF"][i % 3]}"/>`).join(""),
    "#3D2C8D",
  ),
  "garden-brunch": svg(
    [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${160 + i * 190}" cy="${300 + (i % 2) * 120}" r="${110 + (i % 3) * 20}" fill="${["#D4FF3F", "#8EDB5A", "#FFB4A2", "#FFC857"][i % 4]}"/>`).join("") +
      `<rect y="620" width="${W}" height="180" fill="#2F7D4F"/>` +
      `<circle cx="600" cy="640" r="120" fill="#FFFFFF"/><circle cx="600" cy="640" r="80" fill="#FF5C45"/>`,
    "#FFF1D6",
  ),
};
for (const [name, content] of Object.entries(covers)) writeFileSync(join(root, "covers", `${name}.svg`), content);

// Avatars: bold colored discs with simple expressive faces.
const avatars = [
  ["maya", "#FF5C45", "#FFF3B0"], ["jordan", "#2B59FF", "#D4FF3F"], ["priya", "#FFB020", "#1B1A2E"],
  ["eli", "#2FBF8B", "#FFFFFF"], ["sofia", "#FF8FC7", "#1B1A2E"], ["noah", "#8FD3FF", "#1B1A2E"],
  ["sunny", "#D4FF3F", "#1B1A2E"], ["plum", "#7A4DFF", "#FFF3B0"], ["pebble", "#C9C3B6", "#1B1A2E"], ["cherry", "#E5234A", "#FFFFFF"],
];
avatars.forEach(([name, bg, fg], i) => {
  const mouth = [
    `<path d="M32 62 Q50 78 68 62" stroke="${fg}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    `<rect x="36" y="62" width="28" height="8" rx="4" fill="${fg}"/>`,
    `<circle cx="50" cy="66" r="7" fill="${fg}"/>`,
  ][i % 3];
  writeFileSync(
    join(root, "avatars", `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><circle cx="34" cy="42" r="7" fill="${fg}"/><circle cx="66" cy="42" r="7" fill="${fg}"/>${mouth}</svg>`,
  );
});
console.log("Generated", Object.keys(covers).length, "covers and", avatars.length, "avatars");
