# ThunderVox Web

Operator console of the [ThunderVox](https://github.com/beiroun/thundervox)
platform: devices, app clients, sites, who is registered right now and which
calls are in progress. A single-page application served by nginx, talking to
[`thundervox-server`](https://github.com/beiroun/thundervox-server) over
`/api`.

> Status: skeleton. The project builds (`tsc --noEmit` + Vite), the shell with
> navigation is in place, the dashboard reads `GET /api/v1/info` from the
> server; every other page is a placeholder until its server API exists. See
> the platform roadmap in the umbrella repository.

---

## Pages

| Page | What it shows |
|---|---|
| Login | operator sign-in (JWT from the server) |
| Dashboard | devices total / online, app clients, active calls, recent registrations |
| Devices | intercom panels and other endpoints: label, site, SIP number, vendor, **registration status** (online, source address, expiry, user agent); create, edit, issue a password (shown once), block |
| App clients | the same for mobile app accounts; manual creation for tests |
| Sites | buildings / entrances / parking lots and their devices |
| Active calls | live calls from the core: who calls whom, duration, terminate |

## Stack

| | |
|---|---|
| Language | TypeScript 7, strict |
| UI | React 19.3, Mantine 9.6 |
| State / API | Redux Toolkit 2.13 with RTK Query, one API slice per domain, bearer auth with refresh |
| Routing | React Router 8.4 (`createBrowserRouter`) |
| Build | Vite 8.3, Node 24 LTS |
| Types | generated from the server's OpenAPI document — never edited by hand |
| Image | multi-stage Node → nginx 1.30 on `127.0.0.1:8081`: static files plus `location /api` proxied to the server on `127.0.0.1:8080`; published as `ghcr.io/beiroun/thundervox-web:<version>` on a tagged release |

Conventions: functional components and hooks, API slices under `api/`,
pages under `pages/`, no secrets or tokens in logs, comments in English.

## Structure (`src/`)

```
api/          RTK Query: baseQuery (bearer from the auth slice, envelope unwrapping), one createApi per domain
store/        Redux Toolkit: AuthSlice, RootReducer, store + typed hooks
routes/       routes.tsx — createBrowserRouter, created once outside the React tree (React Router 8)
pages/        one folder per page (Dashboard, Placeholder, NotFound; the rest arrive with the server API)
components/   shared components (AppLayout: header with the server version, sidebar)
shared/       navigation.ts — route paths and sidebar entries
theme/        themeMantine.ts
```

Path alias `@/` → `src/`. The server envelope `{data, message, error}` is
unwrapped in `transformResponse`; a `FAIL` envelope is an error even on a 2xx,
and `describeApiError` turns any RTK Query error into the operator-facing text.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server; `/api` is proxied to `http://127.0.0.1:8080` (a locally running `thundervox-server`) |
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
is shown in the header as the console version.

## License

**Business Source License 1.1** — see [`LICENSE`](LICENSE). Non-production use
is free; production use beyond the Additional Use Grant requires a commercial
license from the Licensor. Third-party components keep their own licenses
(`NOTICE` in the umbrella repository).
