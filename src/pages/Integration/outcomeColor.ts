// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { PushDeliveryOutcome } from '@/api/types';

/** Badge colour of a delivery outcome: delivered green, rejected by the operator yellow, failed red, skipped grey. */
export function outcomeColor(outcome: PushDeliveryOutcome): string {
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
