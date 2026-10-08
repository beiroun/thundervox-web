// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Code, Group, NumberInput, PasswordInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useUpdatePushSettingsMutation } from '@/api/integrationApi';
import type { IntegrationOverview, PushSettings } from '@/api/types';
import { useLang } from '@/i18n/LangContext';
import { TestPushModal } from '@/pages/Integration/TestPushModal';
import { formatServerTime } from '@/shared/serverTime';

const contractSample = `{
  "call_id": "6f1c0a0e-4b1e-4c47-9d4a-0b9b1c2c3d4e",
  "sip_call_id": "a84b4c76e66710@192.0.2.10",
  "caller_id": "94.137.9.174:23356",
  "caller_number": "20000001",
  "caller_name": "Mayakovskogo 14, entrance 1",
  "callee_id": "1234567890",
  "callee_number": "10000001",
  "callee_name": "Mayakovskogo 14, flat 11",
  "sip_domain": "sip.thundervox.ru",
  "occurred_at": "2026-10-08T14:03:21+06:00"
}`;

/** How the header value is submitted: untouched, replaced with what was typed, or cleared. */
type SecretChange = 'keep' | 'replace' | 'clear';

/** The wake push gateway: a form for the super administrator, read-only facts for an administrator, a test push for both. */
export function PushSettingsSection({ overview, mayChange }: { overview: IntegrationOverview; mayChange: boolean }) {
  const { t } = useLang();
  const copy = t.integration.push;
  const [updateSettings, { isLoading, error, isSuccess, reset }] = useUpdatePushSettingsMutation();
  const [form, setForm] = useState(() => formFrom(overview.push));
  const [secretChange, setSecretChange] = useState<SecretChange>('keep');
  const [secret, setSecret] = useState('');
  const [testing, setTesting] = useState(false);

  // The server's copy wins whenever it changes (after a save, after another administrator's save)
  useEffect(() => {
    setForm(formFrom(overview.push));
    setSecretChange('keep');
    setSecret('');
  }, [overview.push]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateSettings({
        enabled: form.enabled,
        url: form.url.trim(),
        auth_header_name: form.authHeaderName.trim(),
        auth_header_value: secretChange === 'replace' ? secret : secretChange === 'clear' ? '' : undefined,
        connect_timeout_ms: form.connectTimeoutMs,
        read_timeout_ms: form.readTimeoutMs,
      }).unwrap();
    } catch {
      // Rendered from the mutation state below
    }
  };

  const secretStatus = overview.push.auth_header_value_set
    ? copy.headerValueSet(overview.push.auth_header_value_hint)
    : copy.headerValueNotSet;

  return (
    <section className="tvx-section">
      <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
        <div>
          <h2 className="tvx-section__title" style={{ marginBottom: 8 }}>
            {copy.title}
          </h2>
          <Text size="sm" c="dimmed" maw={720}>
            {copy.lede}
          </Text>
        </div>
        <Button variant="default" leftSection={<IconSend size={16} />} onClick={() => setTesting(true)}>
          {copy.test}
        </Button>
      </Group>

      <form onSubmit={submit}>
        <Stack gap="md" maw={720}>
          <Switch
            label={copy.enabled}
            checked={form.enabled}
            disabled={!mayChange}
            onChange={(event) => {
              reset();
              setForm({ ...form, enabled: event.currentTarget.checked });
            }}
          />
          <TextInput
            label={copy.url}
            description={copy.urlHint}
            value={form.url}
            disabled={!mayChange}
            placeholder="https://api.example.com/api/tv-sip/wake"
            onChange={(event) => {
              reset();
              setForm({ ...form, url: event.currentTarget.value });
            }}
            maxLength={512}
          />
          <TextInput
            label={copy.headerName}
            value={form.authHeaderName}
            disabled={!mayChange}
            onChange={(event) => {
              reset();
              setForm({ ...form, authHeaderName: event.currentTarget.value });
            }}
            maxLength={64}
            required
          />

          {secretChange === 'replace' ? (
            <PasswordInput
              label={copy.headerValue}
              description={copy.headerValueHint}
              value={secret}
              onChange={(event) => setSecret(event.currentTarget.value)}
              autoComplete="off"
              maxLength={512}
              data-autofocus
            />
          ) : (
            <div>
              <Text size="sm" fw={500}>
                {copy.headerValue}
              </Text>
              <Group gap="sm" mt={4}>
                <Text size="sm" c={secretChange === 'clear' ? 'red' : 'dimmed'}>
                  {secretChange === 'clear' ? copy.clearValue : secretStatus}
                </Text>
                {mayChange && (
                  <>
                    <Button size="compact-xs" variant="subtle" onClick={() => setSecretChange('replace')}>
                      {copy.replaceValue}
                    </Button>
                    {overview.push.auth_header_value_set && secretChange !== 'clear' && (
                      <Button size="compact-xs" variant="subtle" color="red" onClick={() => setSecretChange('clear')}>
                        {copy.clearValue}
                      </Button>
                    )}
                  </>
                )}
              </Group>
            </div>
          )}

          <Group grow>
            <NumberInput
              label={copy.connectTimeout}
              value={form.connectTimeoutMs}
              disabled={!mayChange}
              min={200}
              max={30000}
              step={100}
              onChange={(value) => {
                reset();
                setForm({ ...form, connectTimeoutMs: typeof value === 'number' ? value : form.connectTimeoutMs });
              }}
            />
            <NumberInput
              label={copy.readTimeout}
              value={form.readTimeoutMs}
              disabled={!mayChange}
              min={200}
              max={30000}
              step={100}
              onChange={(value) => {
                reset();
                setForm({ ...form, readTimeoutMs: typeof value === 'number' ? value : form.readTimeoutMs });
              }}
            />
          </Group>

          {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
          {isSuccess && <Alert color="teal">{t.common.done}</Alert>}

          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm" c="dimmed">
              {mayChange
                ? overview.push.updated_by && copy.savedBy(overview.push.updated_by, formatServerTime(overview.push.updated_at))
                : copy.readOnlyNote}
            </Text>
            {mayChange && (
              <Button type="submit" loading={isLoading}>
                {t.common.save}
              </Button>
            )}
          </Group>
        </Stack>
      </form>

      <Text size="sm" fw={500} mt="lg" mb={4}>
        {copy.contractTitle}
      </Text>
      <Code block fz="sm" maw={720}>
        {contractSample}
      </Code>
      <Text size="sm" c="dimmed" maw={720} mt="xs">
        {copy.contractNote}
      </Text>

      <TestPushModal opened={testing} url={overview.push.url} onClose={() => setTesting(false)} />
    </section>
  );
}

function formFrom(push: PushSettings) {
  return {
    enabled: push.enabled,
    url: push.url,
    authHeaderName: push.auth_header_name,
    connectTimeoutMs: push.connect_timeout_ms,
    readTimeoutMs: push.read_timeout_ms,
  };
}
