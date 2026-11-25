// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type ReactNode } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

interface EntityCardHeaderProps {
  kicker: string;
  /** What the record is called by: the number, the login. */
  title: ReactNode;
  /** Status and kind next to the title, as the table shows them. */
  badges?: ReactNode;
  /** One muted line under the title, parts joined by " · ". */
  subtitle?: ReactNode;
  /** The "Actions" menu on the right of the title row; absent when the operator may change nothing here. */
  actions?: ReactNode;
  onBack: () => void;
  /** Re-reads the record and whatever else the card loads itself; absent where there is no record request. */
  onRefresh?: () => unknown;
}

/**
 * Top of a record's card page: the page head of the console with the record's key as the title. Page navigation
 * sits at the key – "Back" left of it, "Refresh" right of it – and only actions on the record sit on the right.
 */
export function EntityCardHeader({ kicker, title, badges, subtitle, actions, onBack, onRefresh }: EntityCardHeaderProps) {
  const { t } = useLang();
  // Spins only on the operator's own click: the card's background polling must not make the icon flicker
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="tvx-page__head">
      <div className="tvx-kicker">{kicker}</div>
      <div className="tvx-page__title-row">
        <div className="tvx-card__title">
          <div className="tvx-card__key">
            <Tooltip label={t.common.back}>
              <ActionIcon variant="subtle" color="gray" size={36} aria-label={t.common.back} onClick={onBack}>
                <IconArrowLeft size={22} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
            <h1 className="tvx-title">{title}</h1>
            {onRefresh && (
              <Tooltip label={t.common.refresh}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={36}
                  aria-label={t.common.refresh}
                  loading={refreshing}
                  onClick={() => void refresh()}
                >
                  <IconRefresh size={20} stroke={1.75} />
                </ActionIcon>
              </Tooltip>
            )}
          </div>
          {badges}
        </div>
        {actions}
      </div>
      {subtitle && <div className="tvx-card__subtitle">{subtitle}</div>}
    </div>
  );
}
