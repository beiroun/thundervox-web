// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Badge, Code, Group, Loader, Pagination, Stack, Table, Text } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useGetAuditPageQuery } from '@/api/auditApi';
import type { AuditEntry } from '@/api/types';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import { formatServerTime } from '@/shared/serverTime';

const pageSize = 50;

/** Who changed what, newest first. Every role may read it; nobody can edit it. */
export function Audit() {
  const { t } = useLang();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetAuditPageQuery(
    { page: page - 1, size: pageSize },
    { refetchOnMountOrArgChange: true },
  );
  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <Stack gap="lg">
      <PageHeader page={t.pages.audit} actions={isFetching && !isLoading ? <Loader size="xs" /> : undefined} />

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}

      {data && (
        <>
          <Table.ScrollContainer minWidth={760}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t.audit.columns.time}</Table.Th>
                  <Table.Th>{t.audit.columns.who}</Table.Th>
                  <Table.Th>{t.audit.columns.action}</Table.Th>
                  <Table.Th>{t.audit.columns.details}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" size="sm">
                        {t.audit.nothingYet}
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
                          <Badge size="xs" variant="outline" color="gray">
                            {entry.actor_type.toLowerCase()}
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{t.audit.actions[entry.action] ?? entry.action}</Text>
                    </Table.Td>
                    <Table.Td>
                      <AuditDetails entry={entry} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {pageCount > 1 && <Pagination total={pageCount} value={page} onChange={setPage} />}
        </>
      )}
    </Stack>
  );
}

/** Details are a flat JSON object written by the server; shown compactly as key: value pairs. */
function AuditDetails({ entry }: { entry: AuditEntry }) {
  const { t } = useLang();

  if (!entry.details || typeof entry.details !== 'object') {
    return <Text size="sm">{t.common.none}</Text>;
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
