// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge } from '@mantine/core';

import type { SipAccount } from '@/api/types';

/**
 * Blocked wins over everything (the core refuses the number whatever its registration says); otherwise online is
 * a registration that has not expired yet, as the core stored it.
 */
export function SipAccountStatusBadge({ account }: { account: SipAccount }) {
  if (!account.enabled) {
    return (
      <Badge color="red" variant="light">
        Blocked
      </Badge>
    );
  }
  if (account.registration?.online) {
    return (
      <Badge color="teal" variant="light">
        Online
      </Badge>
    );
  }
  return (
    <Badge color="gray" variant="light">
      Offline
    </Badge>
  );
}
