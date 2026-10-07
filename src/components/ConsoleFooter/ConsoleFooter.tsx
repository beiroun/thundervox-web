// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { useLang } from '@/i18n/LangContext';
import { brand, consoleVersion } from '@/shared/brand';

interface ConsoleFooterProps {
  /**
   * Four lines one under another for the foot of the side column; the default is one row under a hairline
   * (the login page, which has no column).
   */
  stacked?: boolean;
}

/**
 * The running versions (server from GET /info, which is public, so the login page shows it too) and who makes
 * the console: the website and the copyright line.
 */
export function ConsoleFooter({ stacked = false }: ConsoleFooterProps) {
  const { t } = useLang();
  const { data: platformInfo } = useGetPlatformInfoQuery();

  return (
    <footer className={stacked ? 'tvx-footer tvx-footer--stacked' : 'tvx-footer'}>
      <span className="tvx-footer__server">
        {t.footer.server} {platformInfo?.version ?? t.common.none}
      </span>
      <span className="tvx-footer__console">
        {t.footer.console} {consoleVersion}
      </span>
      <a className="tvx-footer__site" href={brand.website} target="_blank" rel="noreferrer">
        {brand.websiteLabel}
      </a>
      <span className="tvx-footer__rights">{t.footer.rights}</span>
    </footer>
  );
}
