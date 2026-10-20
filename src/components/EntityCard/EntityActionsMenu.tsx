// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Button, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

/**
 * Every change of a record lives here, in its card – never in a table row: changes first, the cut-off ones
 * (block, revoke) after them, delete last in red under a divider.
 */
export function EntityActionsMenu({ children }: { children: ReactNode }) {
  const { t } = useLang();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button variant="default" rightSection={<IconChevronDown size={16} />}>
          {t.common.actions}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>{children}</Menu.Dropdown>
    </Menu>
  );
}
