// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Badge, Button, Code, Group, Modal, Select, Stack, Text } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useSendTestPushMutation } from '@/api/integrationApi';
import { useListSipAccountsQuery } from '@/api/sipAccountsApi';
import type { PushTestResult, SipAccount, SipAccountKind } from '@/api/types';
import { useLang } from '@/i18n/LangContext';
import { outcomeColor } from '@/pages/Integration/outcomeColor';

interface TestPushModalProps {
  opened: boolean;
  /** The configured URL; empty means the test cannot run yet. */
  url: string;
  onClose: () => void;
}

/** Sends the real wake request for a chosen panel and subscriber and shows what the operator backend answered. */
export function TestPushModal({ opened, url, onClose }: TestPushModalProps) {
  const { t } = useLang();
  const copy = t.integration.push.testModal;
  const { data: accounts } = useListSipAccountsQuery(undefined, { skip: !opened });
  const [sendTestPush, { isLoading, error, reset }] = useSendTestPushMutation();
  const [caller, setCaller] = useState<string | null>(null);
  const [callee, setCallee] = useState<string | null>(null);
  const [result, setResult] = useState<PushTestResult | null>(null);

  const close = () => {
    setResult(null);
    reset();
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!caller || !callee) {
      return;
    }
    try {
      setResult(await sendTestPush({ caller_username: caller, callee_username: callee }).unwrap());
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <Modal opened={opened} onClose={close} title={copy.title} size="lg">
      <form onSubmit={submit}>
        <Stack gap="md">
          <Text size="sm">{copy.body}</Text>
          {url ? <Code fz="sm">{url}</Code> : <Alert color="yellow">{copy.noUrl}</Alert>}
          <Select
            label={copy.caller}
            data={options(accounts ?? [], 'PANEL', t.sipAccounts.kinds)}
            value={caller}
            onChange={setCaller}
            searchable
            required
          />
          <Select
            label={copy.callee}
            data={options(accounts ?? [], 'CLIENT', t.sipAccounts.kinds)}
            value={callee}
            onChange={setCallee}
            searchable
            required
          />
          {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}

          {result && (
            <Stack gap="xs">
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  {copy.result}
                </Text>
                <Badge color={outcomeColor(result.outcome)} variant="light">
                  {t.integration.deliveries.outcomes[result.outcome]}
                </Badge>
                <Text size="sm" c="dimmed">
                  {copy.status}: {result.http_status ?? t.common.none} · {copy.duration(result.duration_ms)}
                </Text>
              </Group>
              {result.error && (
                <Text size="sm" c="red">
                  {copy.error}: {result.error}
                </Text>
              )}
              {result.response_excerpt && (
                <>
                  <Text size="sm" c="dimmed">
                    {copy.response}
                  </Text>
                  <Code block fz="xs">
                    {result.response_excerpt}
                  </Code>
                </>
              )}
              <Text size="sm" c="dimmed">
                {copy.sentBody}
              </Text>
              <Code block fz="xs">
                {prettyJson(result.sent_body)}
              </Code>
            </Stack>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={close} disabled={isLoading}>
              {t.common.done}
            </Button>
            <Button type="submit" loading={isLoading} disabled={!url || !caller || !callee}>
              {copy.send}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

/** Numbers of the preferred kind first, then the rest: a test may pair any two numbers. */
function options(accounts: SipAccount[], preferred: SipAccountKind, kinds: Record<SipAccountKind, string>) {
  const sorted = [...accounts].sort((a, b) => Number(b.kind === preferred) - Number(a.kind === preferred));
  return sorted.map((account) => ({
    value: account.username,
    label: `${account.username} · ${account.name} (${kinds[account.kind]})`,
  }));
}

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
