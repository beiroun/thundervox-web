// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SipAccountKind } from '@/api/types';

/** Panels in the accent, app clients in the navy - the two brand colours tell the kinds apart. */
export const sipKindColors: Record<SipAccountKind, string> = { PANEL: 'accent', CLIENT: 'brand' };
