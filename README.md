# ThunderVox Web

Operator console of the [ThunderVox](https://github.com/beiroun/thundervox)
platform by [84softworks](https://84softworks.com): SIP numbers of intercom
panels and subscribers (app clients), who is registered right now, console users and the
audit trail. A single-page application served by nginx, talking to
[`thundervox-server`](https://github.com/beiroun/thundervox-server) over
`/api`.

> Status: the provisioning MVP is live - login with roles, SIP numbers,
> console users, audit. Sites and live calls arrive with the core's JSON-RPC.
> See the platform roadmap in the umbrella repository.

---

## Pages

| Page | What it shows |
|---|---|
| Login | operator sign-in (JWT from the server) |
| Dashboard | numbers total / online, panels, subscribers, blocked - as a metric strip; server name, version, license |
| SIP numbers | panels and subscribers (kind `CLIENT` of the API): number, name, **external id** (the endpoint's id in the operator's backend: a panel's device id, an app client's subscriber account - the key of the service API), kind, **registration status** (online, source address, user agent, last seen); create (number and password generated unless typed), edit name and external id, new password (shown once), block, delete |
| Console users | readers, administrators and the environment-defined super administrator; roles as colour-coded abbreviations **SA / ADM / RD** with a legend |
| Audit | every change of numbers and users, by whom and when |
| About | what the console is, running versions, legal: product, author and licensor, website, source, contact, license terms |
| Later | sites, active calls (need the core's JSON-RPC) |

## Look, language, theme

The console wears the **84softworks skin** - the design system of
[84softworks.com](https://84softworks.com) (`design.md` of the landing):
the Slate navy (`#212842`) and the warm orange (`#dd5410`) of the brand, an
achromatic editorial body where the only divider is a hairline, weight 400
everywhere, radius pill or none, no shadows. The console applies it as an
admin, not as a copy of the landing: the top bar sits on the canvas under a
hairline with the mark (navy disc, orange ring, bolt), the small wordmark
"ThunderVox by 84softworks" and the language / theme switches; the primary
navigation is the left column (a drawer under the bar on a phone) with the
operator - login, role badge, log out - at its foot; orange marks the active
page, kickers, metric numbers and primary buttons; navy stays in the mark, the
administrator badge and the active language segment. Fonts are self-hosted (`public/fonts`): **Onest** (Latin +
Cyrillic) for everything, **Clash Display** for the wordmark only.

- **Language** - English and Russian. The first visit follows the browser
  locale (`ru-*` → Russian), the RU / EN pill in the header fixes the choice
  in `localStorage`. Every display string lives in `src/i18n/dict.ts`; the
  browser tab, page headings and server-error fallbacks switch with it.
- **Theme** - light and dark. The first visit follows the operating system;
  the sun / moon button in the header fixes the choice (Mantine's colour
  scheme manager, applied before React mounts by the inline script in
  `index.html`, so a dark console never flashes white). Dark keeps the navy
  band and the orange accent and tints the body with the brand hue.
- **Icons** - the 84softworks set for every device: BMP `favicon.ico`
  (16/32/48), PNG 16/32/96 (round: navy disc, orange ring, orange bolt,
  transparent corners), `apple-touch-icon.png` 180 and maskable 192/512
  (opaque navy squares), `site.webmanifest`, `og-image.png` 1200×630 for
  link previews. Generated from one geometric master by `make_icons.py`
  (kept next to `thundervox-icon.svg` outside this repository); bump `?v=`
  in `index.html` when the art changes.
- **Metadata** - `index.html` carries the description, canonical, Open Graph,
  Twitter card and JSON-LD (WebSite + Organization) the landing has, and
  keeps `noindex, nofollow`: an operator console is not a search result.

## Stack

| | |
|---|---|
| Language | TypeScript 7, strict |
| UI | React 19.3, Mantine 9.6 themed in `src/theme/themeMantine.ts`; page blocks in `src/theme/console.css` |
| State / API | Redux Toolkit 2.13 with RTK Query, one API slice per domain, bearer auth |
| Routing | React Router 8.4 (`createBrowserRouter`) |
| Build | Vite 8.3, Node 24 LTS |
| Types | generated from the server's OpenAPI document — never edited by hand |
| Image | multi-stage Node → nginx 1.30 on `127.0.0.1:8081`: static files plus `location /api` proxied to the server on `127.0.0.1:8080`; published as `ghcr.io/beiroun/thundervox-web:<version>` on a tagged release |

Conventions: functional components and hooks, API slices under `api/`,
pages under `pages/`, no secrets or tokens in logs, comments in English, no
display string outside `i18n/dict.ts`.

## Structure (`src/`)

```
api/          RTK Query: baseQuery (bearer from the auth slice, envelope unwrapping), one createApi per domain
store/        Redux Toolkit: AuthSlice, RootReducer, store + typed hooks
routes/       routes.tsx — createBrowserRouter, created once outside the React tree (React Router 8)
pages/        one folder per page (Login, Dashboard, SipAccounts, ConsoleUsers, Audit, About, NotFound)
components/   AppLayout (band, side column with the operator at its foot, footer), ConsoleHeader, ConsoleFooter, PageHeader,
              LanguageToggle, ColorSchemeToggle, RoleBadge (+ legend), modals
i18n/         dict.ts (EN + RU copy, one type), LangContext.tsx (locale detection, persistence, <html lang>)
shared/       navigation.ts (paths, band entries), consoleRoles.ts (abbreviations, colours, permissions),
              documentTitle.ts (tab title per route and language), brand.ts (links, console version)
theme/        themeMantine.ts (palette, radius, shadows, component defaults), tokens.css, fonts.css, console.css
```

Path alias `@/` → `src/`. The server envelope `{data, message, error}` is
unwrapped in `transformResponse`; a `FAIL` envelope is an error even on a 2xx,
and `describeApiError` turns any RTK Query error into the operator-facing text
in the active language.

## Local development

Two ways to run the console on a laptop:

- **`npm run dev:mock`** - no server, no database. The Vite dev server answers
  `/api/v1` itself from in-memory sample data (`dev/mockApi.ts`): numbers of
  two intercom panels and two app clients (one of them comes and goes online
  every 45 s), four console users, an audit trail that grows with every change
  you make. Status codes, envelopes and localized error texts follow the real
  server, so validation errors, "number taken" and "not allowed" look exactly
  as they will. State lives until the dev server stops. Logins:

  | Login | Password | Role |
  |---|---|---|
  | `admin` | `admin` | SA - super administrator (from the environment, read-only in the users list) |
  | `operator` | `operator` | ADM - administrator |
  | `viewer` | `viewer` | RD - reader |

- **`npm run dev`** - against a real `thundervox-server` on `127.0.0.1:8080`
  (`docker compose up --build` in the server repository starts one with its own
  PostgreSQL; the super administrator there is `admin` / `admin-admin-admin`).

Both open on `http://localhost:5173`. The mock mode never reaches a build: the
plugin hooks only the dev server, `vite build` ignores it.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server; `/api` is proxied to `http://127.0.0.1:8080` (a locally running `thundervox-server`) |
| `npm run dev:mock` | Vite dev server with the built-in mock of the server API (see above) |
| `npm run build` | `tsc --noEmit` then `vite build` → `dist/` (what the image serves) |
| `npm run typecheck` | type check only |
| `npm run update-types` | regenerates `src/api/generated/openapi.ts` from the server's OpenAPI document (`TVX_OPENAPI_URL`, default `http://127.0.0.1:8080/api/v1/openapi`). Runs `openapi-typescript` in an isolated `npx` environment with TypeScript 5, because TypeScript 7 (the native compiler used by the project) ships no programmatic API yet |

Generated types are committed and never edited by hand; the hand-written part
of the contract is only the envelope (`src/api/types.ts`).

## Run

Deployed as an image from the umbrella repository's `docker-compose.yml` on
the same host as the core and the server. nginx listens on `127.0.0.1:8081`
behind the deployment's edge proxy, which owns the public name
(`console.<domain>`) and the certificate; `nginx/default.conf` serves the SPA
(`try_files … /index.html`), caches hashed assets for a year and proxies
`/api/` to `127.0.0.1:8080` unchanged (the server's context path is `/api/v1`).

Because the SPA and the API answer on the same name, the browser makes
same-origin calls and no CORS is involved. A console served from a different
name than its API is the exception: build the image with
`VITE_API_BASE_URL=https://server.<domain>/api/v1` and allow that origin on the
server (`TVX_CORS_ORIGINS`). The value is compiled into the bundle, so it is a
build argument, not a runtime variable.

Image: `docker build -t thundervox-web:dev .` — `node:24-trixie-slim` builds,
`nginx:1.30-trixie` serves; the build arg `APP_VERSION` (the git tag in CI)
is shown in the footer and on the About page as the console version.

## License

**Business Source License 1.1** — see [`LICENSE`](LICENSE). Non-production use
is free; production use beyond the Additional Use Grant requires a commercial
license from the Licensor. Third-party components keep their own licenses
(`NOTICE` in the umbrella repository). Fonts: Onest (SIL Open Font License),
Clash Display (Indian Type Foundry free font license via Fontshare).
