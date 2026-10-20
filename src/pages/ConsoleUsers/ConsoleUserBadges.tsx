// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge, Tooltip } from '@mantine/core';

import type { ConsoleUser } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

export function ConsoleUserStatusBadge({ user }: { user: ConsoleUser }) {
  const { t } = useLang();

  return user.enabled ? (
    <Badge color="teal" variant="light">
      {t.consoleUsers.status.active}
    </Badge>
  ) : (
    <Badge color="red" variant="light">
      {t.consoleUsers.status.blocked}
    </Badge>
  );
}

/** Only the exceptions are drawn: the operator's own record, and the one the server environment defines. */
export function ConsoleUserFlags({ user, isMe }: { user: ConsoleUser; isMe: boolean }) {
  const { t } = useLang();

  return (
    <>
      {isMe && (
        <Badge size="xs" variant="light" color="gray">
          {t.consoleUsers.you}
        </Badge>
      )}
      {user.managed_by_environment && (
        <Tooltip label={t.consoleUsers.environmentManaged}>
          <Badge size="xs" variant="outline" color="gray">
            {t.consoleUsers.environmentFlag}
          </Badge>
        </Tooltip>
      )}
    </>
  );
}
