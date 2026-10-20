// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge, Code, Group, Modal, Stack, Text } from '@mantine/core';

import type { PushDelivery } from '@/api/types';
import { CardField, CardFields, CopyableValue } from '@/components/EntityCard/CardFields';
import { useLang } from '@/i18n/LangContext';
import { outcomeColor } from '@/pages/Integration/outcomeColor';
import { formatServerTime } from '@/shared/serverTime';
import { useIsPhone } from '@/shared/useIsPhone';

/** A number with its external id under it, or a dash when the push did not know the party. */
export function DeliveryParty({ number, externalId }: { number: string | null; externalId: string | null }) {
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

/**
 * The card of one wake push – a window, a log row has no page: both parties, the ids to find the call in the
 * operator's history and the core's log, the address, and the whole response or error the table cuts short.
 * A log row is never changed, so the card has no actions.
 */
export function DeliveryCardModal({ delivery, onClose }: { delivery: PushDelivery | null; onClose: () => void }) {
  const { t } = useLang();
  const isPhone = useIsPhone();

  return (
    <Modal
      opened={delivery !== null}
      onClose={onClose}
      title={delivery ? t.integration.deliveryCard.title(formatServerTime(delivery.created_at)) : ''}
      size="lg"
      fullScreen={isPhone}
    >
      {delivery && <DeliveryCard delivery={delivery} />}
    </Modal>
  );
}

function DeliveryCard({ delivery }: { delivery: PushDelivery }) {
  const { t } = useLang();
  const copy = t.integration.deliveries;
  const card = t.integration.deliveryCard;

  return (
    <Stack gap="lg">
      <Group gap="sm">
        <Badge color={outcomeColor(delivery.outcome)} variant="light">
          {copy.outcomes[delivery.outcome]}
        </Badge>
        <Badge variant="outline" color={delivery.kind === 'TEST' ? 'brand' : 'gray'}>
          {copy.kinds[delivery.kind]}
        </Badge>
      </Group>
      <CardFields>
        <CardField label={copy.columns.time}>{formatServerTime(delivery.created_at)}</CardField>
        <CardField label={copy.columns.from}>
          <DeliveryParty number={delivery.caller_number} externalId={delivery.caller_external_id} />
        </CardField>
        <CardField label={copy.columns.to}>
          <DeliveryParty number={delivery.callee_number} externalId={delivery.callee_external_id} />
        </CardField>
        <CardField label={card.httpStatus}>{delivery.http_status}</CardField>
        <CardField label={card.attempts}>{delivery.attempts}</CardField>
        <CardField label={copy.columns.duration}>{delivery.duration_ms}</CardField>
        <CardField label={card.callId} wide>
          <CopyableValue value={delivery.call_id} label={card.callId} />
        </CardField>
        <CardField label={card.sipCallId} wide>
          {delivery.sip_call_id && <CopyableValue value={delivery.sip_call_id} label={card.sipCallId} />}
        </CardField>
        <CardField label={card.url} wide>
          {delivery.url && <Code fz="sm">{delivery.url}</Code>}
        </CardField>
        <CardField label={card.response} wide>
          {delivery.response_excerpt && <div className="tvx-field__text">{delivery.response_excerpt}</div>}
        </CardField>
        <CardField label={card.error} wide>
          {delivery.error && (
            <Text c="red" className="tvx-field__text">
              {delivery.error}
            </Text>
          )}
        </CardField>
      </CardFields>
    </Stack>
  );
}
