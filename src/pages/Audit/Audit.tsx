// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Badge, Code, Group, Loader, Pagination, Stack, Table, Text, Title } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useGetAuditPageQuery } from '@/api/auditApi';
import type { AuditEntry } from '@/api/types';
import { formatServerTime } from '@/shared/serverTime';

const pageSize = 50;

const actionTitles: Record<string, string> = {
  SIP_ACCOUNT_CREATED: 'Number created',
  SIP_ACCOUNT_RENAMED: 'Number renamed',
  SIP_ACCOUNT_PASSWORD_ROTATED: 'Number password replaced',
  SIP_ACCOUNT_BLOCKED: 'Number blocked',
  SIP_ACCOUNT_UNBLOCKED: 'Number unblocked',
  SIP_ACCOUNT_DELETED: 'Number deleted',
  CONSOLE_USER_CREATED: 'User created',
  CONSOLE_USER_UPDATED: 'User changed',
  CONSOLE_USER_PASSWORD_RESET: 'User password replaced',
  SUPER_ADMINISTRATOR_SYNCED: 'Super administrator synced from the environment',
};

/** Who changed what, newest first. Every role may read it; nobody can edit it. */
export function Audit() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetAuditPageQuery(
    { page: page - 1, size: pageSize },
    { refetchOnMountOrArgChange: true },
  );
  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Audit</Title>
        {isFetching && <Loader size="xs" />}
      </Group>

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error)}</Alert>}

      {data && (
        <>
          <Table striped verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Time</Table.Th>
                <Table.Th>Who</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" size="sm">
                      Nothing has happened yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {data.items.map((entry) => (
                <Table.Tr key={entry.id}>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {formatServerTime(entry.created_at)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm">{entry.actor_login}</Text>
                      {entry.actor_type !== 'ADMIN' && (
                        <Badge size="xs" variant="outline">
                          {entry.actor_type.toLowerCase()}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{actionTitles[entry.action] ?? entry.action}</Text>
                  </Table.Td>
                  <Table.Td>
                    <AuditDetails entry={entry} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {pageCount > 1 && <Pagination total={pageCount} value={page} onChange={setPage} />}
        </>
      )}
    </Stack>
  );
}

/** Details are a flat JSON object written by the server; shown compactly as key: value pairs. */
function AuditDetails({ entry }: { entry: AuditEntry }) {
  if (!entry.details || typeof entry.details !== 'object') {
    return <Text size="sm">–</Text>;
  }
  return (
    <Group gap={6}>
      {Object.entries(entry.details as Record<string, unknown>).map(([key, value]) => (
        <Code key={key} fz="xs">
          {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
        </Code>
      ))}
    </Group>
  );
}
