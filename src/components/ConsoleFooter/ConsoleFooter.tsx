// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { useLang } from '@/i18n/LangContext';
import { brand, consoleVersion } from '@/shared/brand';

/**
 * One muted line under a hairline: the running versions on the left (server from GET /info, which is public,
 * so the login page shows it too), who makes it on the right.
 */
export function ConsoleFooter() {
  const { t } = useLang();
  const { data: platformInfo } = useGetPlatformInfoQuery();

  return (
    <footer className="tvx-footer">
      <span>
        {t.footer.server} {platformInfo?.version ?? t.common.none} · {t.footer.console} {consoleVersion}
      </span>
      <span>
        <a href={brand.website} target="_blank" rel="noreferrer">
          {brand.websiteLabel}
        </a>
        {' · '}
        {t.footer.rights}
      </span>
    </footer>
  );
}
