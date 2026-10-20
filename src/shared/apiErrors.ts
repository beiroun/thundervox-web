// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/** The server's NotFoundException: the record does not exist (any more). */
const notFoundStatus = 410;

/** A card of a deleted or never existing record explains itself instead of offering "retry". */
export function isNotFound(error: FetchBaseQueryError | SerializedError | undefined): boolean {
  return error !== undefined && 'status' in error && error.status === notFoundStatus;
}
