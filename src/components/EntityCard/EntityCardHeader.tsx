// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Button, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

interface EntityCardHeaderProps {
  kicker: string;
  /** What the record is called by: the number, the login. */
  title: ReactNode;
  /** Status and kind next to the title, as the table shows them. */
  badges?: ReactNode;
  /** One muted line under the title, parts joined by " · ". */
  subtitle?: ReactNode;
  /** The "Actions" menu, left of "Back"; absent when the operator may change nothing here. */
  actions?: ReactNode;
  onBack: () => void;
}

/** Top of a record's card page: the page head of the console with the record's key as the title. */
export function EntityCardHeader({ kicker, title, badges, subtitle, actions, onBack }: EntityCardHeaderProps) {
  const { t } = useLang();

  return (
    <div className="tvx-page__head">
      <div className="tvx-kicker">{kicker}</div>
      <div className="tvx-page__title-row">
        <div className="tvx-card__title">
          <h1 className="tvx-title">{title}</h1>
          {badges}
        </div>
        <Group gap="sm" wrap="nowrap">
          {actions}
          <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
            {t.common.back}
          </Button>
        </Group>
      </div>
      {subtitle && <div className="tvx-card__subtitle">{subtitle}</div>}
    </div>
  );
}
