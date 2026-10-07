// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Link } from 'react-router';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import { routePaths } from '@/shared/navigation';

export function NotFound() {
  const { t } = useLang();

  return (
    <>
      <PageHeader page={t.pages.notFound} />
      <p className="tvx-body">
        {t.notFound.body} <Link to={routePaths.dashboard}>{t.notFound.back}</Link>
      </p>
    </>
  );
}
