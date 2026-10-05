// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { ActionIcon, Alert, Button, Code, CopyButton, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconKey } from '@tabler/icons-react';

export interface IssuedCredentialField {
  label: string;
  value: string;
}

interface IssuedCredentialsModalProps {
  /** null = closed. */
  fields: IssuedCredentialField[] | null;
  title: string;
  /** True when a generated password is among the fields: it is shown here once and never again. */
  containsGeneratedPassword: boolean;
  onClose: () => void;
}

/**
 * Shows credentials right after the server issued them. A generated password exists nowhere else - the server
 * keeps only its hash - so the window says so and offers a copy button for every value.
 */
export function IssuedCredentialsModal({ fields, title, containsGeneratedPassword, onClose }: IssuedCredentialsModalProps) {
  return (
    <Modal opened={fields !== null} onClose={onClose} title={title} closeOnClickOutside={false}>
      <Stack gap="md">
        {containsGeneratedPassword && (
          <Alert color="yellow" icon={<IconKey size={18} />}>
            Copy the password now: it is not stored and will not be shown again. A lost password is replaced with a
            new one.
          </Alert>
        )}
        {fields?.map((field) => (
          <Group key={field.label} justify="space-between" wrap="nowrap">
            <div>
              <Text size="xs" c="dimmed">
                {field.label}
              </Text>
              <Code fz="md">{field.value}</Code>
            </div>
            <CopyButton value={field.value}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} aria-label={`Copy ${field.label}`}>
                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        ))}
        <Group justify="flex-end">
          <Button onClick={onClose}>Done</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
