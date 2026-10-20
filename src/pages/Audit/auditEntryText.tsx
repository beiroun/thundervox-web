// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Code, Group, Text } from '@mantine/core';

import type { AuditEntry } from '@/api/types';
import type { Copy } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';

/** The action in the operator's language; an action newer than this console shows its code. */
export function auditActionLabel(entry: AuditEntry, t: Copy): string {
  return t.audit.actions[entry.action] ?? entry.action;
}

/** Details are a flat JSON object written by the server; values as text, in the server's key order. */
export function auditDetailsEntries(entry: AuditEntry): [string, string][] {
  if (!entry.details || typeof entry.details !== 'object' || Array.isArray(entry.details)) {
    return [];
  }
  return Object.entries(entry.details as Record<string, unknown>).map(([key, value]) => [
    key,
    typeof value === 'string' ? value : JSON.stringify(value),
  ]);
}

/** The details in a cell: compact key: value chips; the card shows them as fields. */
export function AuditDetailsPreview({ entry }: { entry: AuditEntry }) {
  const { t } = useLang();
  const details = auditDetailsEntries(entry);

  if (details.length === 0) {
    return <Text size="sm">{t.common.none}</Text>;
  }
  return (
    <Group gap={6}>
      {details.map(([key, value]) => (
        <Code key={key} fz="xs" style={{ overflowWrap: 'anywhere' }}>
          {key}: {value}
        </Code>
      ))}
    </Group>
  );
}
