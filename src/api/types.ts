// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Contract of thundervox-server. Endpoint payload types are generated from the server's OpenAPI document
// (`npm run update-types` -> src/api/generated/openapi.ts) once the server runs; the envelope below is stable
// and is kept by hand because every endpoint shares it.

/** Every server response: success carries data with message "OK", failure carries error with message "FAIL". */
export interface BaseApiResponse<T> {
  data: T | null;
  message: 'OK' | 'FAIL' | string;
  error: FieldErrorDto | null;
}

/** message is technical, localizedMessage is what the operator should read. */
export interface FieldErrorDto {
  message: string;
  localizedMessage: string;
}

/** GET /info */
export interface PlatformInfo {
  name: string;
  version: string;
  license: string;
}
