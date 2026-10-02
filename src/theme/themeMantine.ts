// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createTheme } from '@mantine/core';

/** Console theme: one accent color, the rest is Mantine's default (v9: radius md, medium weight 600). */
export const themeMantine = createTheme({
  primaryColor: 'yellow',
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
});
