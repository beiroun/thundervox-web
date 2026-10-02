# ThunderVox Web

Operator console of the [ThunderVox](https://github.com/beiroun/thundervox)
platform: devices, app clients, sites, who is registered right now and which
calls are in progress. A single-page application served by nginx, talking to
[`thundervox-server`](https://github.com/beiroun/thundervox-server) over
`/api`.

> Status: in design. The console is built once the server API is stable; see
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
| Image | multi-stage Node → nginx 1.30: static files plus `location /api` proxied to the server on `127.0.0.1:8080`; published as `ghcr.io/beiroun/thundervox-web:<version>` on a tagged release |

Conventions: functional components and hooks, API slices under `api/`,
pages under `pages/`, no secrets or tokens in logs, comments in English.

## Run

Deployed as an image from the umbrella repository's `docker-compose.yml` on
the same host as the core and the server. nginx listens on port 80 (TLS is a
separate step on the platform domain).

## License

**Business Source License 1.1** — see [`LICENSE`](LICENSE). Non-production use
is free; production use beyond the Additional Use Grant requires a commercial
license from the Licensor. Third-party components keep their own licenses
(`NOTICE` in the umbrella repository).
