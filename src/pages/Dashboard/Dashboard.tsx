// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Alert, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { useListSipAccountsQuery } from '@/api/sipAccountsApi';
import { describeApiError } from '@/api/baseQuery';
import type { SipAccount } from '@/api/types';

/** Counters over the SIP numbers; computed from the same list the SIP numbers page shows. */
function countNumbers(accounts: SipAccount[]) {
  const enabled = accounts.filter((account) => account.enabled);
  return [
    { label: 'Numbers', value: accounts.length },
    { label: 'Online now', value: enabled.filter((account) => account.registration?.online).length },
    { label: 'Panels', value: accounts.filter((account) => account.kind === 'PANEL').length },
    { label: 'App clients', value: accounts.filter((account) => account.kind === 'CLIENT').length },
    { label: 'Blocked', value: accounts.length - enabled.length },
  ];
}

/** Landing page: the state of the numbers at a glance and proof that the console reaches the server. */
export function Dashboard() {
  const { data: platformInfo, isLoading: platformLoading, error: platformError } = useGetPlatformInfoQuery();
  const { data: accounts, error: accountsError } = useListSipAccountsQuery(undefined, { pollingInterval: 30_000 });

  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard</Title>

      {accountsError && <Alert color="red">{describeApiError(accountsError)}</Alert>}
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        {(accounts ? countNumbers(accounts) : []).map((counter) => (
          <Card key={counter.label} withBorder>
            <Text size="sm" c="dimmed">
              {counter.label}
            </Text>
            <Text size="xl" fw={600}>
              {counter.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder>
        <Title order={5} mb="sm">
          Server
        </Title>
        {platformLoading && <Loader size="sm" />}
        {platformError && (
          <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Server not reachable">
            {describeApiError(platformError)}
          </Alert>
        )}
        {platformInfo && (
          <Group gap="xl">
            <InfoField label="Name" value={platformInfo.name} />
            <InfoField label="Version" value={platformInfo.version} />
            <InfoField label="License" value={platformInfo.license} />
          </Group>
        )}
      </Card>
    </Stack>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600}>{value}</Text>
    </div>
  );
}
