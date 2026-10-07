// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';

import type { PageCopy } from '@/i18n/dict';

/** Top of every page: the orange kicker, the title in the heroline scale and, on the right, the page's actions. */
export function PageHeader({ page, actions }: { page: PageCopy; actions?: ReactNode }) {
  return (
    <div className="tvx-page__head">
      <div>
        <div className="tvx-kicker">{page.kicker}</div>
        <h1 className="tvx-title">{page.title}</h1>
      </div>
      {actions}
    </div>
  );
}
