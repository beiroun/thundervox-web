// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import '@mantine/core/styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';
import { MantineProvider } from '@mantine/core';

import { store } from '@/store/store';
import { router } from '@/routes/routes';
import { themeMantine } from '@/theme/themeMantine';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('index.html has no #root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={themeMantine} defaultColorScheme="auto">
        <RouterProvider router={router} />
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
