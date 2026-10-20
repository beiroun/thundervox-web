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
| Dashboard | presence and activity: online, offline, subscribers, pushes, registrations, calls as a metric strip, then two charts (presence, activity) over a selectable period - 1 h, 6 h, 1 d, 1 w, 1 mo (`GET /dashboard?range=`); re-read every 30 s. The server's identity lives on About and in the footer |
| SIP numbers | panels and subscribers (kind `CLIENT` of the API): number, name, **external id** (the endpoint's id in the operator's backend: a panel's device id, an app client's subscriber account - the key of the service API), kind, **registration status** from the server's journal (online with its devices and since when, or offline with the time it was last online, or never registered); create (number and password generated unless typed). A row opens the **number's card** (`/sip-accounts/:id`): every field, the registration in full, and the **Actions** menu - edit name and external id, new password (shown once), block / unblock, delete |
| Console users | readers, administrators and the environment-defined super administrator; roles as colour-coded abbreviations **SA / ADM / RD** with a legend. A row opens the **user's card** (`/console-users/:id`) with the Actions menu: change role, new password, block / unblock |
| Audit | every change of numbers, users, tokens and push settings, by whom and when; a row opens the entry's card with every detail and a link to the record it touched |
| Integration | the whole seam with the operator's backend: named **service API tokens** (issued once, hashed on the server; a row opens the token's card, revoked there), ready-made **endpoint links** with the public API address, the **wake push** gateway (URL, auth header, timeouts, a test push with the real contract body), and the **delivery log** of every push (a row opens the delivery's card with the full response or error). Administrators read and test; the super administrator changes |
| About | what the console is, running versions, legal: product, author and licensor, website, source, contact, license terms |
| Later | sites, active calls (need the core's JSON-RPC) |

### Tables

Every table is one primitive (`components/AdaptiveTable`, wrapped by `ListTable` for lists):

- **Never scrolls sideways.** Columns have a default width (or grow into the free width) and a priority 1-5; what
  does not fit leaves by priority (5 first, equal ones from the right), the corner of the last heading lists what
  left. Priority 1 (the number, the name) never leaves.
- **Widths are the operator's.** The edge between two headings moves width from one column to its neighbour
  (double click - the default, arrows on the focused edge - 10 px, with Shift 40); widths are remembered in the
  browser per table (`tvx-table-column-widths:<table id>`).
- **Smart search** in every table (`shared/smartQuery.ts`, the same rule as Modus admin): lower case and
  `ё → е`, words in any order must all be found (partial works), at least one word of 3 characters, at most 100;
  a one-word query equal to a key (number, external id, login, call id) puts that row first. Lists the server
  returns whole (numbers, users, tokens) search in the browser; the paged journals (audit, deliveries) send
  `query` and the server applies the same rule. An IP is found by its digits too (`178.74` finds `178.74.67.30:5060`).
- **Sort by the headings** of lists held in memory: descending → ascending → the list's own order; empty values
  last. The journals keep the server's newest-first order.
- **State in the address**: search, filters, sort, page and page size (`?query=&kind=&sort=&direction=&page=&size=`,
  prefixed on the Integration page) - a link, F5 and Back from a card return the same selection.
- **No actions in a table**: a row opens its card - a page for numbers and users, a window for tokens, journal
  entries and deliveries; every change lives in the card's **Actions** menu.

## Look, language, theme

The console wears the **84softworks skin** - the design system of
[84softworks.com](https://84softworks.com) (`design.md` of the landing):
the Slate navy (`#212842`) and the warm orange (`#dd5410`) of the brand, an
achromatic editorial body where the only divider is a hairline, weight 400
everywhere, radius pill or none, no shadows. The console applies it as an
admin, not as a copy of the landing: the top bar sits on the canvas under a
hairline with the mark (navy disc, orange ring, bolt) and the small wordmark
"ThunderVox by 84softworks" at the left, the operator (login, role badge),
the log-out and the language / theme switches at the right; the primary
navigation is the left column (a drawer under the bar on a phone), an icon
before every item, with the running versions and the copyright line at its
foot; orange marks the active page (label and icon, no dot), kickers, metric
numbers and primary buttons; navy stays in the mark, the
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
pages/        one folder per page (Login, Dashboard, SipAccounts, SipAccountCard, ConsoleUsers, ConsoleUserCard, Audit,
              Integration, About, NotFound)
components/   AppLayout (top bar, side column with the versions at its foot), ConsoleHeader (mark, operator, switches),
              ConsoleFooter (versions + maker: column foot, login page), PageHeader,
              AdaptiveTable (widths, priorities, sort headings), ListTable (states of a list), SearchInput,
              TablePagination, EntityCard (card head, Actions menu, fields),
              LanguageToggle, ColorSchemeToggle, RoleBadge (+ legend), modals
i18n/         dict.ts (EN + RU copy, one type), LangContext.tsx (locale detection, persistence, <html lang>)
shared/       navigation.ts (paths, column entries with their icons), consoleRoles.ts (abbreviations, colours, permissions),
              smartQuery.ts, useClientList.ts, useListUrlState.ts, columnSort.ts (search, filters, sort, pages of a list),
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
is shown at the foot of the side column and on the About page as the console version.

## License

**Business Source License 1.1** — see [`LICENSE`](LICENSE). Non-production use
is free; production use beyond the Additional Use Grant requires a commercial
license from the Licensor. Third-party components keep their own licenses
(`NOTICE` in the umbrella repository). Fonts: Onest (SIL Open Font License),
Clash Display (Indian Type Foundry free font license via Fontshare).
