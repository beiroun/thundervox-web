// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';

import type { PageCopy } from '@/i18n/dict';

/**
 * Top of every page: the orange kicker, then the title in the heroline scale with the page's actions on the
 * same line (the "new …" button lives next to the title, not in a row of its own).
 */
export function PageHeader({ page, actions }: { page: PageCopy; actions?: ReactNode }) {
  return (
    <div className="tvx-page__head">
      <div className="tvx-kicker">{page.kicker}</div>
      <div className="tvx-page__title-row">
        <h1 className="tvx-title">{page.title}</h1>
        {actions}
      </div>
    </div>
  );
}
