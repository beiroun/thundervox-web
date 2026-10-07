// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Alert, Loader } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { useListSipAccountsQuery } from '@/api/sipAccountsApi';
import type { SipAccount } from '@/api/types';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import type { Copy } from '@/i18n/dict';
import { consoleVersion } from '@/shared/brand';

/** Counters over the SIP numbers; computed from the same list the SIP numbers page shows. */
function countNumbers(accounts: SipAccount[], labels: Copy['dashboard']['counters']) {
  const enabled = accounts.filter((account) => account.enabled);
  return [
    { label: labels.numbers, value: accounts.length },
    { label: labels.onlineNow, value: enabled.filter((account) => account.registration?.online).length },
    { label: labels.panels, value: accounts.filter((account) => account.kind === 'PANEL').length },
    { label: labels.appClients, value: accounts.filter((account) => account.kind === 'CLIENT').length },
    { label: labels.blocked, value: accounts.length - enabled.length },
  ];
}

/** Landing page: the state of the numbers as a metric strip, and proof that the console reaches the server. */
export function Dashboard() {
  const { t } = useLang();
  const { data: platformInfo, isLoading: platformLoading, error: platformError } = useGetPlatformInfoQuery();
  const { data: accounts, error: accountsError } = useListSipAccountsQuery(undefined, { pollingInterval: 30_000 });

  return (
    <>
      <PageHeader page={t.pages.dashboard} />

      {accountsError && <Alert color="red">{describeApiError(accountsError, t.api)}</Alert>}
      <div className="tvx-metrics">
        {(accounts ? countNumbers(accounts, t.dashboard.counters) : []).map((counter) => (
          <div className="tvx-metric" key={counter.label}>
            <div className="tvx-metric__num">{counter.value}</div>
            <div className="tvx-metric__lbl">{counter.label}</div>
          </div>
        ))}
      </div>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.dashboard.server}</h2>
        {platformLoading && <Loader size="sm" />}
        {platformError && (
          <Alert color="red" icon={<IconAlertTriangle size={18} />} title={t.dashboard.serverUnreachable}>
            {describeApiError(platformError, t.api)}
          </Alert>
        )}
        {platformInfo && (
          <>
            <FactRow label={t.dashboard.serverName}>{platformInfo.name}</FactRow>
            <FactRow label={t.dashboard.serverVersion}>{platformInfo.version}</FactRow>
            <FactRow label={t.dashboard.serverLicense}>{platformInfo.license}</FactRow>
            <FactRow label={t.dashboard.consoleVersion}>{consoleVersion}</FactRow>
          </>
        )}
      </section>
    </>
  );
}

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tvx-row">
      <span className="tvx-row__lbl">{label}</span>
      <span className="tvx-row__val">{children}</span>
    </div>
  );
}
