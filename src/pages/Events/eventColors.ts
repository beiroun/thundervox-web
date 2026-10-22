// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { CallOutcome, PushDeliveryOutcome, RegistrationEventKind, SipAccountKind } from '@/api/types';
import type { Copy } from '@/i18n/dict';

/**
 * Badge colour of a registration: online green; a panel gone offline red – the intercom cannot call; any other
 * number offline grey – that is a phone's normal life.
 */
export function registrationColor(kind: RegistrationEventKind, accountKind: SipAccountKind | undefined): string {
  if (kind === 'ONLINE') {
    return 'teal';
  }
  return accountKind === 'PANEL' ? 'red' : 'gray';
}

/**
 * Badge colour of a call: answered green, in progress in the navy, ended by a person (canceled, declined) grey,
 * nobody answered yellow, broken red.
 */
export function callOutcomeColor(outcome: CallOutcome): string {
  switch (outcome) {
    case 'ANSWERED':
      return 'teal';
    case 'RINGING':
      return 'brand';
    case 'CANCELED':
    case 'REJECTED':
      return 'gray';
    case 'NO_ANSWER':
      return 'yellow';
    case 'FAILED':
      return 'red';
  }
}

/** Badge colour of a push: delivered green, rejected by the operator yellow, failed red, skipped grey. */
export function pushOutcomeColor(outcome: PushDeliveryOutcome): string {
  switch (outcome) {
    case 'DELIVERED':
      return 'teal';
    case 'REJECTED':
      return 'yellow';
    case 'FAILED':
      return 'red';
    case 'SKIPPED':
      return 'gray';
  }
}

type ServiceCallStatusClass = keyof Copy['events']['serviceCall']['statuses'];

/**
 * What a service API status means. The server's error taxonomy has its own codes (410 not found, 413 not allowed,
 * 511 wrong input, 510/514/560 server side), so the class is read off the code, not off its hundred.
 */
export function serviceCallStatusClass(status: number): ServiceCallStatusClass {
  if (status < 300) {
    return 'ok';
  }
  switch (status) {
    case 401:
      return 'refused';
    case 403:
    case 413:
      return 'forbidden';
    case 404:
    case 410:
      return 'notFound';
    case 400:
    case 405:
    case 406:
    case 415:
    case 511:
    case 512:
      return 'badRequest';
    default:
      return 'serverError';
  }
}

/** A refusal and a failure of the server are red: the backend is not getting through; a bad request is yellow. */
export function serviceCallStatusColor(status: number): string {
  switch (serviceCallStatusClass(status)) {
    case 'ok':
      return 'teal';
    case 'refused':
    case 'forbidden':
    case 'serverError':
      return 'red';
    case 'notFound':
    case 'badRequest':
      return 'yellow';
  }
}
