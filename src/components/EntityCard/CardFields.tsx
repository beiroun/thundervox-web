// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { ActionIcon, Code, CopyButton, Group, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

/** The fields of a record as a grid: as many columns as fit, a caption over every value. */
export function CardFields({ children }: { children: ReactNode }) {
  return <div className="tvx-fields">{children}</div>;
}

/** One field; an empty value reads as a dash. */
export function CardField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  const { t } = useLang();
  const empty = children === null || children === undefined || children === '';

  return (
    <div className={wide ? 'tvx-field tvx-field--wide' : 'tvx-field'}>
      <div className="tvx-field__lbl">{label}</div>
      <div className="tvx-field__val">{empty ? t.common.none : children}</div>
    </div>
  );
}

/** A key to paste somewhere else (a number, an external id, a call id): monospace with a copy button. */
export function CopyableValue({ value, label }: { value: string; label: string }) {
  const { t } = useLang();

  return (
    <Group gap={4} wrap="nowrap" align="center">
      <Code fz="sm" style={{ overflowWrap: 'anywhere' }}>
        {value}
      </Code>
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t.common.copied : t.common.copy}>
            <ActionIcon
              size="md"
              variant="subtle"
              color={copied ? 'teal' : 'gray'}
              onClick={copy}
              aria-label={t.common.copyValue(label)}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
