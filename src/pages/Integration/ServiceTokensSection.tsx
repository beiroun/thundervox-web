// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Badge, Button, Code, Group, Loader, Table, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useListServiceTokensQuery, useRevokeServiceTokenMutation } from '@/api/integrationApi';
import type { IssuedServiceToken, ServiceToken } from '@/api/types';
import { ConfirmActionModal } from '@/components/ConfirmActionModal/ConfirmActionModal';
import { IssuedCredentialsModal } from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { useLang } from '@/i18n/LangContext';
import { IssueServiceTokenModal } from '@/pages/Integration/IssueServiceTokenModal';
import { formatServerTime } from '@/shared/serverTime';

/** Service API tokens: a table, "new token" and "revoke" for the super administrator. */
export function ServiceTokensSection({ mayChange }: { mayChange: boolean }) {
  const { t } = useLang();
  const copy = t.integration.tokens;
  const { data: tokens, isLoading, error } = useListServiceTokensQuery();
  const [revokeToken, revokeState] = useRevokeServiceTokenMutation();
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedServiceToken | null>(null);
  const [revoking, setRevoking] = useState<ServiceToken | null>(null);

  const confirmRevoke = async () => {
    if (!revoking) {
      return;
    }
    try {
      await revokeToken(revoking.id).unwrap();
      setRevoking(null);
    } catch {
      // Rendered inside the dialog from the mutation state
    }
  };

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
        {mayChange && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
            {copy.newToken}
          </Button>
        )}
      </Group>

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}

      {tokens && (
        <Table.ScrollContainer minWidth={720}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{copy.columns.name}</Table.Th>
                <Table.Th>{copy.columns.prefix}</Table.Th>
                <Table.Th>{copy.columns.status}</Table.Th>
                <Table.Th>{copy.columns.created}</Table.Th>
                <Table.Th>{copy.columns.lastUsed}</Table.Th>
                {mayChange && <Table.Th w={48} />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tokens.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={mayChange ? 6 : 5}>
                    <Text c="dimmed" size="sm">
                      {copy.nothingYet}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {tokens.map((token) => (
                <Table.Tr key={token.id}>
                  <Table.Td>
                    <Text size="sm">{token.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Code fz="sm">{token.token_prefix}…</Code>
                  </Table.Td>
                  <Table.Td>
                    {token.enabled ? (
                      <Badge color="teal" variant="light">
                        {copy.status.active}
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light">
                        {copy.status.revoked}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {formatServerTime(token.created_at)}
                      <Text component="span" size="sm" c="dimmed">
                        {' '}
                        · {token.created_by}
                      </Text>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {token.last_used_at ? formatServerTime(token.last_used_at) : copy.neverUsed}
                    </Text>
                  </Table.Td>
                  {mayChange && (
                    <Table.Td>
                      {token.enabled && (
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => {
                            revokeState.reset();
                            setRevoking(token);
                          }}
                        >
                          {copy.revoke}
                        </Button>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <IssueServiceTokenModal opened={creating} onClose={() => setCreating(false)} onIssued={setIssued} />
      <IssuedCredentialsModal
        fields={issued ? [{ label: copy.valueLabel, value: issued.value }] : null}
        title={copy.issuedTitle}
        containsGeneratedPassword={false}
        warning={copy.issuedWarning}
        onClose={() => setIssued(null)}
      />
      <ConfirmActionModal
        opened={revoking !== null}
        title={copy.revokeTitle(revoking?.name ?? '')}
        confirmLabel={copy.revoke}
        loading={revokeState.isLoading}
        error={revokeState.isError ? describeApiError(revokeState.error, t.api) : null}
        onConfirm={() => void confirmRevoke()}
        onClose={() => setRevoking(null)}
      >
        {copy.revokeBody}
      </ConfirmActionModal>
    </section>
  );
}
