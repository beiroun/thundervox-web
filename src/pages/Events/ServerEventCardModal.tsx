// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge, Button, Code, Group, Modal, Stack, Text } from '@mantine/core';
import { IconListSearch } from '@tabler/icons-react';
import { Link } from 'react-router';

import type { CallEvent, PushDelivery, RegistrationEvent, ServerEvent, ServerEventCategory, ServiceCall } from '@/api/types';
import { CardField, CardFields, CopyableValue } from '@/components/EntityCard/CardFields';
import { useLang } from '@/i18n/LangContext';
import { callOutcomeColor, pushOutcomeColor, registrationColor } from '@/pages/Events/eventColors';
import {
  ServiceCallStatusBadge,
  callTalkSeconds,
  callWakeSeconds,
  eventTitle,
  serviceCallBackend,
} from '@/pages/Events/eventPresentation';
import { smartQueryMinWordLength } from '@/shared/smartQuery';
import { sipAccountPath } from '@/shared/navigation';
import { formatServerTime, formatSpan } from '@/shared/serverTime';
import { useIsPhone } from '@/shared/useIsPhone';

/** The log searched by a key of the record: its number, its call, its backend. */
export interface RelatedEvents {
  query: string;
  category?: ServerEventCategory;
}

interface ServerEventCardModalProps {
  /** null = closed. */
  event: ServerEvent | null;
  onClose: () => void;
  /** Closes the card and shows the log narrowed to what belongs together with the record. */
  onShowRelated: (related: RelatedEvents) => void;
}

/**
 * The card of one line of the event log – a window, a log line has no page: every field its journal keeps, links
 * to the numbers' cards and to the rest of the log about the same number, call or backend. A log line is never
 * changed, so the card has no actions.
 */
export function ServerEventCardModal({ event, onClose, onShowRelated }: ServerEventCardModalProps) {
  const { t } = useLang();
  const isPhone = useIsPhone();

  return (
    <Modal
      opened={event !== null}
      onClose={onClose}
      title={event ? `${eventTitle(event, t)} · ${formatServerTime(event.occurred_at)}` : ''}
      size="lg"
      fullScreen={isPhone}
    >
      {event && (
        <Stack gap="lg">
          {event.registration && <RegistrationCard registration={event.registration} occurredAt={event.occurred_at} />}
          {event.call && <CallCard call={event.call} />}
          {event.push && <PushCard push={event.push} occurredAt={event.occurred_at} />}
          {event.service_call && <ServiceCallCard call={event.service_call} occurredAt={event.occurred_at} />}
          <RelatedButton event={event} onShowRelated={onShowRelated} />
        </Stack>
      )}
    </Modal>
  );
}

function RegistrationCard({ registration, occurredAt }: { registration: RegistrationEvent; occurredAt: string }) {
  const { t } = useLang();
  const copy = t.events.registration;
  const account = registration.account;

  return (
    <>
      <Group gap="sm">
        <Badge color={registrationColor(registration.kind, account?.kind)} variant="light">
          {copy.states[registration.kind]}
        </Badge>
        {account && (
          <Badge variant="outline" color="gray">
            {t.sipAccounts.kinds[account.kind]}
          </Badge>
        )}
      </Group>
      <CardFields>
        <CardField label={t.events.columns.time}>{formatServerTime(occurredAt)}</CardField>
        <CardField label={copy.number}>
          <NumberValue number={registration.username} accountId={account?.id ?? null} />
        </CardField>
        <CardField label={copy.account}>
          {account ? (
            <>
              <div>{account.name}</div>
              {account.external_id && <div className="tvx-field__note">{account.external_id}</div>}
            </>
          ) : (
            copy.noAccount
          )}
        </CardField>
        <CardField label={copy.userAgent}>{registration.user_agent}</CardField>
        <CardField label={copy.received}>{registration.received}</CardField>
        <CardField label={copy.contact} wide>
          {registration.contact}
        </CardField>
      </CardFields>
    </>
  );
}

function CallCard({ call }: { call: CallEvent }) {
  const { t } = useLang();
  const copy = t.events.call;
  const talk = callTalkSeconds(call);

  return (
    <>
      <Group gap="sm">
        <Badge color={callOutcomeColor(call.outcome)} variant="light">
          {copy.outcomes[call.outcome]}
        </Badge>
        {call.mode && (
          <Badge variant="outline" color={call.mode === 'WAKE' ? 'brand' : 'gray'}>
            {copy.modes[call.mode]}
          </Badge>
        )}
      </Group>
      <CardFields>
        <CardField label={copy.from}>
          <PartyValue number={call.caller_number} accountId={call.caller_account_id} notes={[call.caller_name, call.caller_external_id]} />
        </CardField>
        <CardField label={copy.to}>
          <PartyValue number={call.callee_number} accountId={call.callee_account_id} notes={[call.callee_name, call.callee_external_id]} />
        </CardField>
        <CardField label={copy.started}>{formatServerTime(call.started_at)}</CardField>
        <CardField label={copy.answered}>{call.answered_at ? formatServerTime(call.answered_at) : null}</CardField>
        <CardField label={copy.ended}>{call.ended_at ? formatServerTime(call.ended_at) : null}</CardField>
        <CardField label={copy.talk}>{talk !== null ? formatSpan(talk) : null}</CardField>
        {call.mode === 'WAKE' && (
          <CardField label={copy.calleeRegistered} wide>
            <CalleeRegistration call={call} />
          </CardField>
        )}
        <CardField label={copy.endReason} wide>
          {call.end_reason && (
            <>
              <div>{copy.endReasons[call.end_reason] ?? call.end_reason}</div>
              {call.end_code !== null && <div className="tvx-field__note">SIP {call.end_code}</div>}
            </>
          )}
        </CardField>
        <CardField label={copy.sipCallId} wide>
          <CopyableValue value={call.sip_call_id} label={copy.sipCallId} />
        </CardField>
      </CardFields>
    </>
  );
}

/**
 * Whether the wake push reached the phone: the callee came online, or registered a new device, while its call
 * waited – the server notes it on the call (subscribers' registrations are not journaled on their own).
 */
function CalleeRegistration({ call }: { call: CallEvent }) {
  const { t } = useLang();
  const copy = t.events.call;
  const wake = callWakeSeconds(call);

  if (wake !== null && call.callee_registered_at) {
    return (
      <>
        <div>{copy.wokeAfter(wake)}</div>
        <div className="tvx-field__note">{formatServerTime(call.callee_registered_at)}</div>
      </>
    );
  }
  return (
    <>
      <div>{call.outcome === 'RINGING' ? copy.notWokenYet : copy.notWoken}</div>
      <div className="tvx-field__note">{copy.notWokenNote}</div>
    </>
  );
}

function PushCard({ push, occurredAt }: { push: PushDelivery; occurredAt: string }) {
  const { t } = useLang();
  const copy = t.events.push;

  return (
    <>
      <Group gap="sm">
        <Badge color={pushOutcomeColor(push.outcome)} variant="light">
          {copy.outcomes[push.outcome]}
        </Badge>
        <Badge variant="outline" color={push.kind === 'TEST' ? 'brand' : 'gray'}>
          {copy.kinds[push.kind]}
        </Badge>
      </Group>
      <CardFields>
        <CardField label={t.events.columns.time}>{formatServerTime(occurredAt)}</CardField>
        <CardField label={copy.from}>
          <PartyValue number={push.caller_number} accountId={push.caller_account_id} notes={[push.caller_external_id]} />
        </CardField>
        <CardField label={copy.to}>
          <PartyValue number={push.callee_number} accountId={push.callee_account_id} notes={[push.callee_external_id]} />
        </CardField>
        <CardField label={copy.httpStatus}>{push.http_status}</CardField>
        <CardField label={copy.attempts}>{push.attempts}</CardField>
        <CardField label={t.events.duration}>{push.duration_ms}</CardField>
        <CardField label={copy.callId} wide>
          <CopyableValue value={push.call_id} label={copy.callId} />
        </CardField>
        <CardField label={copy.sipCallId} wide>
          {push.sip_call_id && <CopyableValue value={push.sip_call_id} label={copy.sipCallId} />}
        </CardField>
        <CardField label={copy.url} wide>
          {push.url && <Code fz="sm">{push.url}</Code>}
        </CardField>
        <CardField label={copy.response} wide>
          {push.response_excerpt && <div className="tvx-field__text">{push.response_excerpt}</div>}
        </CardField>
        <CardField label={copy.error} wide>
          {push.error && (
            <Text c="red" className="tvx-field__text">
              {push.error}
            </Text>
          )}
        </CardField>
      </CardFields>
    </>
  );
}

function ServiceCallCard({ call, occurredAt }: { call: ServiceCall; occurredAt: string }) {
  const { t } = useLang();
  const copy = t.events.serviceCall;
  const endpoint = [call.sip_kind, call.external_id].filter(Boolean).join(' ');

  return (
    <>
      <Group gap="sm">
        <ServiceCallStatusBadge status={call.http_status} />
        <Badge variant="outline" color="gray">
          {copy.operations[call.operation]}
        </Badge>
      </Group>
      <CardFields>
        <CardField label={t.events.columns.time}>{formatServerTime(occurredAt)}</CardField>
        <CardField label={copy.backend}>
          <Text size="sm" c={call.caller_auth === 'TOKEN' ? undefined : 'red'} component="span">
            {serviceCallBackend(call, t)}
          </Text>
        </CardField>
        <CardField label={copy.tokenPrefix}>{call.token_prefix && <Code fz="sm">{call.token_prefix}</Code>}</CardField>
        <CardField label={copy.request} wide>
          <Code fz="sm" style={{ overflowWrap: 'anywhere' }}>{`${call.method} ${call.path}`}</Code>
        </CardField>
        <CardField label={copy.endpoint}>{endpoint || null}</CardField>
        <CardField label={copy.number}>
          {call.username && <NumberValue number={call.username} accountId={call.account_id} />}
        </CardField>
        <CardField label={copy.httpStatus}>{call.http_status}</CardField>
        <CardField label={t.events.duration}>{call.duration_ms}</CardField>
        <CardField label={copy.remoteAddress}>{call.remote_address}</CardField>
        <CardField label={copy.error} wide>
          {call.error && (
            <Text c="red" className="tvx-field__text">
              {call.error}
            </Text>
          )}
        </CardField>
      </CardFields>
    </>
  );
}

/** A number with a link to its card when the console has the account. */
function NumberValue({ number, accountId }: { number: string; accountId: number | null }) {
  const { t } = useLang();

  return (
    <Group gap={8} wrap="wrap" align="center">
      <CopyableValue value={number} label={t.events.registration.number} />
      {accountId !== null && (
        <Link to={sipAccountPath(accountId)} className="tvx-link">
          {t.events.openNumber}
        </Link>
      )}
    </Group>
  );
}

/** A party of a call or a push: its number (with the link to its card) and what else is known about it. */
function PartyValue({ number, accountId, notes }: { number: string | null; accountId: number | null; notes: (string | null)[] }) {
  const known = notes.filter(Boolean);
  if (!number) {
    return null;
  }
  return (
    <>
      <NumberValue number={number} accountId={accountId} />
      {known.map((note) => (
        <div key={note} className="tvx-field__note">
          {note}
        </div>
      ))}
    </>
  );
}

/**
 * The rest of the log about the same thing: a number's other events, a call's push and its line, a backend's other
 * calls. Absent when the key is too short for the smart search to look it up.
 */
function RelatedButton({ event, onShowRelated }: { event: ServerEvent; onShowRelated: (related: RelatedEvents) => void }) {
  const { t } = useLang();
  const related = relatedOf(event, t.events.related);
  if (!related || related.query.length < smartQueryMinWordLength) {
    return null;
  }
  return (
    <Group>
      <Button
        variant="default"
        leftSection={<IconListSearch size={16} />}
        onClick={() => onShowRelated({ query: related.query, category: related.category })}
      >
        {related.label}
      </Button>
    </Group>
  );
}

function relatedOf(
  event: ServerEvent,
  labels: { number: string; call: string; backend: string },
): (RelatedEvents & { label: string }) | null {
  if (event.registration) {
    return { query: event.registration.username, label: labels.number };
  }
  if (event.call) {
    return { query: event.call.sip_call_id, label: labels.call };
  }
  if (event.push) {
    // A test push has no SIP call behind it: its own call id is the key
    return { query: event.push.sip_call_id ?? event.push.call_id, label: labels.call };
  }
  if (event.service_call?.caller_auth === 'TOKEN' && event.service_call.token_name) {
    return { query: event.service_call.token_name, category: 'SERVICE_CALL', label: labels.backend };
  }
  return null;
}
