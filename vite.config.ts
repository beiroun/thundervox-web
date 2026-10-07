// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Extension spelled out: Vite's native config loader (the future default) resolves no extensionless imports
import { mockApiPlugin } from './dev/mockApi.ts';

export default defineConfig(({ mode }) => {
  // `npm run dev:mock`: the dev server itself answers /api/v1 from in-memory sample data - no thundervox-server,
  // no database; see dev/mockApi.ts for the logins. Never part of a build: the plugin only hooks the dev server.
  const mockApi = mode === 'mock';

  return {
    plugins: [react(), ...(mockApi ? [mockApiPlugin()] : [])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Local development against a server started with TVX_SERVER_BIND=127.0.0.1 (same path nginx proxies in
      // the image); in mock mode the plugin takes /api before any proxy would
      proxy: mockApi ? undefined : { '/api': 'http://127.0.0.1:8080' },
    },
  };
});
