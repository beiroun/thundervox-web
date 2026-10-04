// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

interface ImportMetaEnv {
  /** Set by the image build from the git tag; "dev" when running from sources. */
  readonly VITE_APP_VERSION?: string;
  /**
   * Absolute API base, e.g. `https://server.example.com/api/v1`. Baked in at BUILD time, so an image built
   * without it stays same-origin - which is the normal deployment, where nginx proxies /api next to the SPA.
   * Only set it for a console served from a name that is not the one the API answers on; the server must
   * then allow that origin (TVX_CORS_ORIGINS).
   */
  readonly VITE_API_BASE_URL?: string;
}
