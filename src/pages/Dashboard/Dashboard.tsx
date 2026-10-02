// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Alert, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { describeApiError } from '@/api/baseQuery';

/** Counters that the server exposes once the provisioning domain exists; shown as placeholders until then. */
const plannedCounters = ['Devices online', 'App clients', 'Active calls', 'Registrations in the last hour'];

/** Landing page: proves the console reaches the server and reserves the place for the live counters. */
export function Dashboard() {
  const { data: platformInfo, isLoading, error } = useGetPlatformInfoQuery();

  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard</Title>

      <Card withBorder>
        <Title order={5} mb="sm">
          Server
        </Title>
        {isLoading && <Loader size="sm" />}
        {error && (
          <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Server not reachable">
            {describeApiError(error)}
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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {plannedCounters.map((label) => (
          <Card key={label} withBorder>
            <Text size="sm" c="dimmed">
              {label}
            </Text>
            <Text size="xl" fw={600}>
              –
            </Text>
          </Card>
        ))}
      </SimpleGrid>
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
