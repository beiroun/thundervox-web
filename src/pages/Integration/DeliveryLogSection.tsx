// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Badge, Button, Group, Loader, Pagination, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useGetPushDeliveriesQuery } from '@/api/integrationApi';
import { useLang } from '@/i18n/LangContext';
import { outcomeColor } from '@/pages/Integration/outcomeColor';
import { formatServerTime } from '@/shared/serverTime';

const pageSize = 25;
const detailsPreviewLength = 60;

/** What happened to every wake push, newest first. */
export function DeliveryLogSection() {
  const { t } = useLang();
  const copy = t.integration.deliveries;
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useGetPushDeliveriesQuery(
    { page: page - 1, size: pageSize },
    { refetchOnMountOrArgChange: true },
  );
  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <section className="tvx-section">
      <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
        <div>
          <h2 className="tvx-section__title" style={{ marginBottom: 8 }}>
            {copy.title}
          </h2>
          <Text size="sm" c="dimmed" maw={720}>
            {copy.lede}
          </Text>
        </div>
        <Button variant="default" leftSection={<IconRefresh size={16} />} loading={isFetching && !isLoading} onClick={() => void refetch()}>
          {copy.refresh}
        </Button>
      </Group>

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}

      {data && (
        <Stack gap="md">
          <Table.ScrollContainer minWidth={900}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{copy.columns.time}</Table.Th>
                  <Table.Th>{copy.columns.kind}</Table.Th>
                  <Table.Th>{copy.columns.from}</Table.Th>
                  <Table.Th>{copy.columns.to}</Table.Th>
                  <Table.Th>{copy.columns.outcome}</Table.Th>
                  <Table.Th>{copy.columns.status}</Table.Th>
                  <Table.Th>{copy.columns.duration}</Table.Th>
                  <Table.Th>{copy.columns.details}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text c="dimmed" size="sm">
                        {copy.nothingYet}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {data.items.map((delivery) => {
                  const details = delivery.error ?? delivery.response_excerpt ?? '';
                  return (
                    <Table.Tr key={delivery.id}>
                      <Table.Td>
                        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                          {formatServerTime(delivery.created_at)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="xs" variant="outline" color={delivery.kind === 'TEST' ? 'brand' : 'gray'}>
                          {copy.kinds[delivery.kind]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Party number={delivery.caller_number} externalId={delivery.caller_external_id} />
                      </Table.Td>
                      <Table.Td>
                        <Party number={delivery.callee_number} externalId={delivery.callee_external_id} />
                      </Table.Td>
                      <Table.Td>
                        <Badge color={outcomeColor(delivery.outcome)} variant="light">
                          {copy.outcomes[delivery.outcome]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{delivery.http_status ?? t.common.none}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{delivery.duration_ms ?? t.common.none}</Text>
                      </Table.Td>
                      <Table.Td>
                        {details.length > detailsPreviewLength ? (
                          <Tooltip label={details} multiline w={420}>
                            <Text size="sm" c={delivery.error ? 'red' : undefined} style={{ cursor: 'help' }}>
                              {details.slice(0, detailsPreviewLength)}…
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text size="sm" c={delivery.error ? 'red' : undefined}>
                            {details || t.common.none}
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {pageCount > 1 && <Pagination total={pageCount} value={page} onChange={setPage} />}
        </Stack>
      )}
    </section>
  );
}

/** A number with its external id under it, or a dash when the push did not know the party. */
function Party({ number, externalId }: { number: string | null; externalId: string | null }) {
  const { t } = useLang();

  if (!number) {
    return <Text size="sm">{t.common.none}</Text>;
  }
  return (
    <div>
      <Text size="sm">{number}</Text>
      {externalId && (
        <Text size="xs" c="dimmed">
          {externalId}
        </Text>
      )}
    </div>
  );
}
