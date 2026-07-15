# nm-chronicles

A standalone Angular application for the Newport Maeve Chronicles. This repository supports local development, static deployment to GitHub Pages, and server deployment to Cloudflare Workers using Angular SSR.

## Project architecture

- Angular version: `22.x`
- Standalone components and signals-based state management
- Two deployment targets:
  - GitHub Pages: static build with client-side routing and route metadata injection
  - Cloudflare: server-rendered build with neutral platform worker and SSR
- Runtime environment configuration is centralized in `src/app/config.ts`
- Share metadata is augmented for prerendered GitHub Pages routes via `scripts/prerender-gh-pages.js`

## Folder layout

- `src/`: application source code
  - `app/`: views, pages, layouts, services, directives
  - `cloudflare/`: Cloudflare worker entrypoint for SSR
  - `main.ts`: browser entrypoint
  - `main.server.ts`: server entrypoint for SSR builds
  - `server.ts`: example Node server entrypoint
- `public/`: static assets copied into browser builds
- `scripts/`: deployment and prerender helper scripts
- `dist/`: build output folders
- `wrangler.toml`: Cloudflare build configuration
- `angular.json`: Angular build targets and environment-specific configurations

## Environment-specific behavior

The app supports three runtime environments using `APP_ENVIRONMENT_CONFIG` in `src/app/config.ts`:

- `local`
  - Identified by `localhost` or `127.0.0.1`
  - Uses asset base path `/`
  - Canonical URL is the current local origin
- `dev`
  - Identified by a GitHub Pages path prefix `/nm-chronicles/` or `github.io` host
  - Uses asset base path `/nm-chronicles/`
  - Canonical URL is `${origin}/nm-chronicles/`
- `production`
  - Identified by host ending in `newportmaeve.com`
  - Uses asset base path `/`
  - Canonical URL is `https://newportmaeve.com/`

This runtime config is used to:

- build absolute asset URLs with `buildAssetUrl()`
- resolve static images and JSON data paths across deploy targets
- generate canonical URLs and share links

## Build targets

### Local development

```bash
ng serve
```

Open `http://localhost:4200/` to view the app locally.

### GitHub Pages static build

```bash
npm run build:github-pages
```

- Builds the app with `githubPages` configuration from `angular.json`
- Output path: `dist/github-pages`
- `baseHref`: `/nm-chronicles/`
- `outputMode`: `static`
- `ssr`: `false`

After the static build, the `postbuild:github-pages` lifecycle script runs:

```bash
node scripts/prerender-gh-pages.js && node scripts/generate-seo-assets.js github-pages dist/github-pages/browser
```

This workflow reads the generated `dist/github-pages/browser/index.html`, writes route-specific HTML for known pages, and generates GitHub Pages SEO assets:

- Open Graph metadata (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter metadata
- canonical links
- `<title>` tags
- `robots.txt`
- `sitemap.xml`

The route metadata definitions are centralized in `scripts/route-metadata.js`, and environment-specific SEO asset generation is handled by `scripts/generate-seo-assets.js`.

### Cloudflare Workers SSR build

```bash
npm run build:cloudflare
```

- Builds the app with `cloudflare` configuration from `angular.json`
- Output path: `dist/nm-chronicles-cloudflare`
- `baseHref`: `/`
- `outputMode`: `server`
- SSR entrypoint: `src/cloudflare/worker.ts`

Deployment is handled by Wrangler:

```bash
npm run deploy:cloudflare
```

This publishes the worker using the `production` environment in `wrangler.toml`.

The Cloudflare build also supports environment-specific SEO assets via the `postbuild:cloudflare` lifecycle script, which generates `robots.txt` and `sitemap.xml` inside `dist/nm-chronicles-cloudflare/browser`.

## Deployment commands

- GitHub Pages build: `npm run build:github-pages`
- GitHub Pages deploy: `npm run deploy:github-pages`
- Cloudflare build: `npm run build:cloudflare`
- Cloudflare deploy: `npm run deploy:cloudflare`

## Cloudflare configuration

`wrangler.toml` defines:

- `main = "src/cloudflare/worker.ts"`
- `compatibility_date`
- `build.command = "npm run build:cloudflare"`
- `build.upload.dir = "dist/nm-chronicles-cloudflare/browser"`

The worker entrypoint uses `@angular/ssr` and `AngularAppEngine` to render requests.

## Metadata and prerendering

- `src/app/app.routes.server.ts` configures server prerendering for pages such as `character/:id`
- The static GitHub Pages workflow generates a prerendered HTML page for each route defined in `scripts/route-metadata.js`
- Page metadata is injected after build so each prerendered route has tailored social sharing metadata

## Notes on robots and sitemap behavior

- The project currently includes a root `robot.txt` file. If you need environment-specific robots rules, move or duplicate this file into `public/robots.txt` and customize the contents per deployment target.
- The app should expose an XML sitemap at a deployment root such as `/sitemap.xml` for production indexing.

## Testing

Run unit tests with:

```bash
ng test
```

## Useful references

- Angular CLI docs: https://angular.dev/tools/cli
- Angular SSR docs: https://angular.dev/guide/universal
- Cloudflare Wrangler docs: https://developers.cloudflare.com/workers/
