// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';

import { useLang } from '@/i18n/LangContext';

interface ConfirmActionModalProps {
  opened: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmColor?: string;
  loading: boolean;
  /** Error of the last attempt, shown inside the dialog so the operator can retry or cancel. */
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** "Are you sure" for actions that cut a device off or cannot be undone. */
export function ConfirmActionModal({
  opened,
  title,
  children,
  confirmLabel,
  confirmColor = 'red',
  loading,
  error,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const { t } = useLang();

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack gap="md">
        <Text size="sm">{children}</Text>
        {error && <Alert color="red">{error}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t.common.cancel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
