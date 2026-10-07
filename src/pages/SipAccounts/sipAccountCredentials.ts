// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SipAccountCredentials } from '@/api/types';
import type { IssuedCredentialField } from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import type { Copy } from '@/i18n/dict';

/**
 * What goes into the device's SIP settings: the number (it is both the SIP username and the authentication
 * username - the core refuses a registration whose auth name differs from the number), the domain (also the
 * digest realm) and - when the server made it up - the password. Display name / caller id fields on the device
 * are free: the core never reads the From header as an identity. `labels` is the active language's block.
 */
export function sipCredentialFields(
  credentials: SipAccountCredentials,
  labels: Copy['sipAccounts']['credentials'],
): IssuedCredentialField[] {
  const fields: IssuedCredentialField[] = [
    { label: labels.number, value: credentials.account.username },
    { label: labels.domain, value: credentials.realm },
  ];
  if (credentials.generated_password) {
    fields.push({ label: labels.password, value: credentials.generated_password });
  }
  return fields;
}
