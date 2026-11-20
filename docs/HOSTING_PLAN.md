# Hosting plan: GitHub Pages

Repository: https://github.com/rohanpa27/Travel-App-Prototype
Live site (after the one-time setup below): https://rohanpa27.github.io/Travel-App-Prototype/

## How it works

- The app is a static export (`web/out/`), so GitHub Pages can host it for free with no server.
- `.github/workflows/pages.yml` runs on every push to `main`: install, type check, lint, unit tests, build, publish.
- Pull requests run the same checks without publishing, so a broken change never reaches the live site.
- The build sets `NEXT_PUBLIC_BASE_PATH=/Travel-App-Prototype`. Locally the variable is empty, so `npm run dev` is unchanged.

## One-time setup (repository owner)

1. Open the repository on GitHub, then **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Open the **Actions** tab and check that "Deploy to GitHub Pages" finished. The site address appears on its summary.

## Keeping the online copy in sync

Every change made here is committed and pushed to `main`. The workflow then republishes the site, usually within two minutes.

## Collaborators

- Add people under **Settings > Collaborators**. They can then clone, push branches and open pull requests.
- Suggested rule: work on a branch, open a pull request, wait for the checks to pass, then merge. Turn on branch protection for `main` (require the "build" check) so the live site always passes its tests.
- Contribution steps are in `CONTRIBUTING.md`.

## What visitors see

GitHub Pages is static, so there is no shared database. Everyone opens the same four demo trips, and each person's changes are saved in their own browser only. Reset demo restores the starting data. People can look around, vote and try every flow, but they do not see each other's changes live.

Real shared editing needs a backend (for example a free-tier database with sign-in). That is outside this prototype's rules (no backend, no keys) and is a good next phase.

## Rules that keep hosting working

- Images from `public/` go through `asset()` in `web/lib/paths.ts`, so they load under `/Travel-App-Prototype/`.
- Navigation uses Next `Link` and the router, which add the base path on their own. Avoid hard-coded `href="/trip"` on plain `<a>` tags.
- Test the hosted build locally: `NEXT_PUBLIC_BASE_PATH=/Travel-App-Prototype npm run build && NEXT_PUBLIC_BASE_PATH=/Travel-App-Prototype npm run test:e2e`.
- Renaming the product to Joliday: set a repository variable or edit `web/lib/brand.ts`, then push.
