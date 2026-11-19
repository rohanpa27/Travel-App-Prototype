// Serves the static build (out/) on a free port and runs every browser suite against it.
// Usage: npm run build && npm run test:e2e
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
if (!existsSync(join(root, "out", "index.html"))) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, () => {
    const { port } = s.address();
    s.close(() => resolve(port));
  });
});

const server = spawn(join(root, "node_modules", ".bin", "serve"), ["out", "-l", String(port)], { cwd: root, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const suites = ["flows", "trips", "robustness", "a11y"];
let failed = 0;
for (const name of suites) {
  console.log(`\n=== ${name} ===`);
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [join(root, "tests", "e2e", `${name}.mjs`)], { cwd: root, stdio: "inherit", env: { ...process.env, BASE_URL: `http://localhost:${port}` } });
    child.on("exit", resolve);
  });
  if (code !== 0) failed += 1;
}
server.kill();
console.log(failed ? `\n${failed} suite(s) failed` : "\nAll browser suites passed");
process.exit(failed ? 1 : 0);
