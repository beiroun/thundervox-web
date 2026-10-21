// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Button, Group, Menu, Modal, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';

import { describeApiError } from '@/api/baseQuery';
import { useRevokeServiceTokenMutation } from '@/api/integrationApi';
import type { ServiceToken } from '@/api/types';
import { CardField, CardFields, CopyableValue } from '@/components/EntityCard/CardFields';
import { EntityActionsMenu } from '@/components/EntityCard/EntityActionsMenu';
import { useLang } from '@/i18n/LangContext';
import { ServiceTokenStatusBadge } from '@/pages/Integration/ServiceTokenStatusBadge';
import { eventsSearchPath } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { useIsPhone } from '@/shared/useIsPhone';

interface ServiceTokenCardModalProps {
  /** null = closed. */
  token: ServiceToken | null;
  /** The super administrator: the only one who revokes. */
  mayChange: boolean;
  onClose: () => void;
}

/**
 * The card of a service token – a window, the token has no page of its own. Revoking is confirmed in the same
 * window and returns to the card, which then shows the token as revoked.
 */
export function ServiceTokenCardModal({ token, mayChange, onClose }: ServiceTokenCardModalProps) {
  const isPhone = useIsPhone();

  return (
    <Modal opened={token !== null} onClose={onClose} title={token?.name ?? ''} size="lg" fullScreen={isPhone}>
      {/* Keyed by token: a card opened for another token starts on the card view, not on a pending confirmation */}
      {token && <ServiceTokenCard key={token.id} token={token} mayChange={mayChange} />}
    </Modal>
  );
}

function ServiceTokenCard({ token, mayChange }: { token: ServiceToken; mayChange: boolean }) {
  const { t } = useLang();
  const copy = t.integration.tokens;
  const [revokeToken, revokeState] = useRevokeServiceTokenMutation();
  const [confirming, setConfirming] = useState(false);

  const confirmRevoke = async () => {
    try {
      await revokeToken(token.id).unwrap();
      setConfirming(false);
    } catch {
      // Rendered in the confirmation from the mutation state
    }
  };

  if (confirming) {
    return (
      <Stack gap="md">
        <Text fz="lg">{copy.revokeTitle(token.name)}</Text>
        <Text size="sm">{copy.revokeBody}</Text>
        {revokeState.isError && <Alert color="red">{describeApiError(revokeState.error, t.api)}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirming(false)} disabled={revokeState.isLoading}>
            {t.common.cancel}
          </Button>
          <Button color="red" onClick={() => void confirmRevoke()} loading={revokeState.isLoading}>
            {copy.revoke}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <ServiceTokenStatusBadge token={token} />
        {mayChange && token.enabled && (
          <EntityActionsMenu>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => {
                revokeState.reset();
                setConfirming(true);
              }}
            >
              {copy.revoke}
            </Menu.Item>
          </EntityActionsMenu>
        )}
      </Group>
      <CardFields>
        <CardField label={copy.columns.name}>{token.name}</CardField>
        <CardField label={copy.columns.prefix}>
          <CopyableValue value={token.token_prefix} label={copy.columns.prefix} />
        </CardField>
        <CardField label={copy.columns.created}>{formatServerTime(token.created_at)}</CardField>
        <CardField label={copy.createdBy}>{token.created_by}</CardField>
        <CardField label={copy.columns.lastUsed}>
          {token.last_used_at ? formatServerTime(token.last_used_at) : copy.neverUsed}
        </CardField>
        <CardField label={copy.revokedAt}>{token.revoked_at ? formatServerTime(token.revoked_at) : null}</CardField>
      </CardFields>
      <div>
        <Link to={eventsSearchPath(token.name, 'SERVICE_CALL')} className="tvx-link">
          {copy.callsLink}
        </Link>
      </div>
      <Text size="sm" c="dimmed">
        {copy.cardNote}
      </Text>
    </Stack>
  );
}
