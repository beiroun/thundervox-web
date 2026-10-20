// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge } from '@mantine/core';

import type { SipAccount } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

/**
 * Blocked wins over everything (the core refuses the number whatever its registration says); otherwise online is
 * what the server's registration journal says - a device reachable right now, at most a sampler tick (10 s) behind.
 */
export function SipAccountStatusBadge({ account }: { account: SipAccount }) {
  const { t } = useLang();

  if (!account.enabled) {
    return (
      <Badge color="red" variant="light">
        {t.sipAccounts.status.blocked}
      </Badge>
    );
  }
  if (account.registration?.online) {
    return (
      <Badge color="teal" variant="light">
        {t.sipAccounts.status.online}
      </Badge>
    );
  }
  return (
    <Badge color="gray" variant="light">
      {t.sipAccounts.status.offline}
    </Badge>
  );
}

/** The order of the status column, the same precedence as the badge: online above offline above blocked. */
export function sipAccountStatusRank(account: SipAccount): number {
  if (!account.enabled) {
    return 0;
  }
  return account.registration?.online ? 2 : 1;
}
