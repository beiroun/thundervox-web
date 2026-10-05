// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SipAccountCredentials } from '@/api/types';
import type { IssuedCredentialField } from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';

/** What goes into the device's SIP settings: number, domain and - when the server made it up - the password. */
export function sipCredentialFields(credentials: SipAccountCredentials): IssuedCredentialField[] {
  const fields: IssuedCredentialField[] = [
    { label: 'Number (login)', value: credentials.account.username },
    { label: 'SIP domain', value: credentials.realm },
  ];
  if (credentials.generated_password) {
    fields.push({ label: 'Password', value: credentials.generated_password });
  }
  return fields;
}
