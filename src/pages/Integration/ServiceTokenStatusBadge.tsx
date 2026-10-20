// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge } from '@mantine/core';

import type { ServiceToken } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

export function ServiceTokenStatusBadge({ token }: { token: ServiceToken }) {
  const { t } = useLang();

  return token.enabled ? (
    <Badge color="teal" variant="light">
      {t.integration.tokens.status.active}
    </Badge>
  ) : (
    <Badge color="gray" variant="light">
      {t.integration.tokens.status.revoked}
    </Badge>
  );
}
