// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMediaQuery } from '@mantine/hooks';

/** Below Mantine's `sm` (48em): the same edge as the phone rules in the CSS. */
export const phoneMediaQuery = '(max-width: 47.99em)';

/**
 * True on a phone. Read at the first render, not in an effect: a phone must not paint the desktop layout of a
 * table or a dialog first and jump a frame later.
 */
export function useIsPhone(): boolean {
  return useMediaQuery(phoneMediaQuery, undefined, { getInitialValueInEffect: false });
}
