// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Badge, Code, Group, Text } from '@mantine/core';
import { IconAccessPoint, IconApi, IconBellRinging, IconPhoneCall, type TablerIcon } from '@tabler/icons-react';

import type { CallEvent, ServerEvent, ServerEventCategory, ServiceCall } from '@/api/types';
import type { Copy } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import {
  callOutcomeColor,
  pushOutcomeColor,
  registrationColor,
  serviceCallStatusClass,
  serviceCallStatusColor,
} from '@/pages/Events/eventColors';
import { formatSpan, serverTimeSecondsBetween } from '@/shared/serverTime';

/** One icon per journal, so a mixed log reads by its left edge. */
export const eventCategoryIcons: Record<ServerEventCategory, TablerIcon> = {
  REGISTRATION: IconAccessPoint,
  CALL: IconPhoneCall,
  PUSH: IconBellRinging,
  SERVICE_CALL: IconApi,
};

/** What the line is: also the title of its card. */
export function eventTitle(event: ServerEvent, t: Copy): string {
  const titles = t.events.titles;
  if (event.registration) {
    return event.registration.kind === 'ONLINE' ? titles.online : titles.offline;
  }
  if (event.call) {
    return titles.call;
  }
  if (event.push) {
    return event.push.kind === 'TEST' ? titles.pushTest : titles.pushLive;
  }
  return titles.serviceCall;
}

/** Who called the service API: the token's name, or how the caller failed to name itself. */
export function serviceCallBackend(call: ServiceCall, t: Copy): string {
  if (call.caller_auth === 'TOKEN') {
    return call.token_name ?? '';
  }
  return t.events.serviceCall.callers[call.caller_auth];
}

/** From the answer to the end of the call; null while it is still going or when nobody answered. */
export function callTalkSeconds(call: CallEvent): number | null {
  return call.answered_at ? serverTimeSecondsBetween(call.answered_at, call.ended_at) : null;
}

/** The outcome of a line as a badge, in the colour of its journal's vocabulary. */
export function EventOutcomeBadge({ event }: { event: ServerEvent }) {
  const { t } = useLang();
  const copy = t.events;

  if (event.registration) {
    return (
      <Badge color={registrationColor(event.registration.kind)} variant="light">
        {copy.registration.states[event.registration.kind]}
      </Badge>
    );
  }
  if (event.call) {
    return (
      <Badge color={callOutcomeColor(event.call.outcome)} variant="light">
        {copy.call.outcomes[event.call.outcome]}
      </Badge>
    );
  }
  if (event.push) {
    return (
      <Badge color={pushOutcomeColor(event.push.outcome)} variant="light">
        {copy.push.outcomes[event.push.outcome]}
      </Badge>
    );
  }
  if (event.service_call) {
    return <ServiceCallStatusBadge status={event.service_call.http_status} />;
  }
  return null;
}

/** The status a service API call got: the code and what it means in this server's taxonomy. */
export function ServiceCallStatusBadge({ status }: { status: number }) {
  const { t } = useLang();

  return (
    <Badge color={serviceCallStatusColor(status)} variant="light">
      {`${status} · ${t.events.serviceCall.statuses[serviceCallStatusClass(status)]}`}
    </Badge>
  );
}

/** The "Event" cell: the journal's icon, what happened, and the one word that tells such lines apart. */
export function EventWhatCell({ event }: { event: ServerEvent }) {
  const { t } = useLang();
  const Icon = eventCategoryIcons[event.category];
  const note = event.call?.mode
    ? t.events.call.modes[event.call.mode]
    : event.service_call
      ? t.events.serviceCall.operations[event.service_call.operation]
      : null;

  return (
    <Group gap={8} wrap="nowrap" align="flex-start">
      <Icon size={16} stroke={1.75} className="tvx-event__icon" />
      <div>
        <Text size="sm">{eventTitle(event, t)}</Text>
        {note && (
          <Text size="xs" c="dimmed">
            {note}
          </Text>
        )}
      </div>
    </Group>
  );
}

/** The "Who" cell: the number, the two parties of a call or a push, the backend of an API call. */
export function EventPartiesCell({ event }: { event: ServerEvent }) {
  const { t } = useLang();

  if (event.registration) {
    return <Party number={event.registration.username} note={event.registration.account?.name} />;
  }
  if (event.call) {
    return (
      <PartyPair
        from={event.call.caller_number}
        to={event.call.callee_number}
        note={joinNames(event.call.caller_name, event.call.callee_name)}
      />
    );
  }
  if (event.push) {
    return (
      <PartyPair
        from={event.push.caller_number}
        to={event.push.callee_number}
        note={joinNames(event.push.caller_external_id, event.push.callee_external_id)}
      />
    );
  }
  if (event.service_call) {
    const call = event.service_call;
    const endpoint = [call.sip_kind, call.external_id].filter(Boolean).join(' ');
    return (
      <div>
        <Text size="sm" c={call.caller_auth === 'TOKEN' ? undefined : 'red'}>
          {serviceCallBackend(call, t)}
        </Text>
        {(call.username || endpoint) && (
          <Group gap={6} wrap="wrap">
            {call.username && <Code fz="xs">{call.username}</Code>}
            {endpoint && (
              <Text size="xs" c="dimmed" style={{ overflowWrap: 'anywhere' }}>
                {endpoint}
              </Text>
            )}
          </Group>
        )}
      </div>
    );
  }
  return null;
}

/** The "Details" cell: the device that came up, the course of a call, the answer of a push, the request of a call. */
export function EventDetailsCell({ event }: { event: ServerEvent }) {
  const { t } = useLang();
  const copy = t.events;

  if (event.registration) {
    const parts = [event.registration.user_agent, event.registration.received].filter(Boolean);
    return <DetailText>{parts.join(' · ') || t.common.none}</DetailText>;
  }
  if (event.call) {
    const call = event.call;
    const talk = callTalkSeconds(call);
    const parts = [
      talk !== null ? `${copy.call.talk} ${formatSpan(talk)}` : null,
      call.end_reason ? (copy.call.endReasons[call.end_reason] ?? call.end_reason) : null,
      call.end_code !== null && call.end_reason !== 'bye' ? String(call.end_code) : null,
    ].filter(Boolean);
    return <DetailText>{parts.join(' · ') || t.common.none}</DetailText>;
  }
  if (event.push) {
    const push = event.push;
    if (push.error) {
      return <DetailText color="red">{push.error}</DetailText>;
    }
    const parts = [
      push.http_status !== null ? `HTTP ${push.http_status}` : null,
      push.duration_ms !== null ? copy.durationMs(push.duration_ms) : null,
      push.response_excerpt,
    ].filter(Boolean);
    return <DetailText>{parts.join(' · ') || t.common.none}</DetailText>;
  }
  if (event.service_call) {
    const call = event.service_call;
    return (
      <div>
        <Text size="sm" lineClamp={1} style={{ overflowWrap: 'anywhere' }}>
          {`${call.method} ${call.path}`}
        </Text>
        {call.error && (
          <Text size="xs" c="red" lineClamp={2}>
            {call.error}
          </Text>
        )}
      </div>
    );
  }
  return null;
}

function DetailText({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <Text size="sm" c={color} lineClamp={2} style={{ overflowWrap: 'anywhere' }}>
      {children}
    </Text>
  );
}

function Party({ number, note }: { number: string | null; note?: string | null }) {
  const { t } = useLang();

  return (
    <div>
      {number ? <Code fz="sm">{number}</Code> : <Text size="sm">{t.common.none}</Text>}
      {note && (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {note}
        </Text>
      )}
    </div>
  );
}

function PartyPair({ from, to, note }: { from: string | null; to: string | null; note: string | null }) {
  const { t } = useLang();

  return (
    <div>
      <Group gap={6} wrap="wrap">
        {from ? <Code fz="sm">{from}</Code> : <Text size="sm">{t.common.none}</Text>}
        <Text size="sm" c="dimmed">
          →
        </Text>
        {to ? <Code fz="sm">{to}</Code> : <Text size="sm">{t.common.none}</Text>}
      </Group>
      {note && (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {note}
        </Text>
      )}
    </div>
  );
}

function joinNames(from: string | null, to: string | null): string | null {
  if (!from && !to) {
    return null;
  }
  return `${from ?? '–'} → ${to ?? '–'}`;
}
