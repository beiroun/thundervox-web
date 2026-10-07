// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge, Tooltip } from '@mantine/core';

import type { ConsoleRole } from '@/api/types';
import { useLang } from '@/i18n/LangContext';
import { consoleRoleAbbreviations, consoleRoleColors, consoleRoles } from '@/shared/consoleRoles';

/** A role as its colour-coded abbreviation (SA / ADM / RD); the full name is in the tooltip and the legend. */
export function RoleBadge({ role }: { role: ConsoleRole }) {
  const { t } = useLang();

  return (
    <Tooltip label={t.roles.titles[role]}>
      <Badge variant="light" color={consoleRoleColors[role]}>
        {consoleRoleAbbreviations[role]}
      </Badge>
    </Tooltip>
  );
}

/** Abbreviation next to its full name for every role, so the badges need no explanation elsewhere. */
export function RoleLegend() {
  const { t } = useLang();

  return (
    <div className="tvx-legend">
      <span>{t.roles.legend}:</span>
      {consoleRoles.map((role) => (
        <span key={role} className="tvx-legend__item">
          <Badge variant="light" color={consoleRoleColors[role]}>
            {consoleRoleAbbreviations[role]}
          </Badge>
          {t.roles.titles[role]}
        </span>
      ))}
    </div>
  );
}
