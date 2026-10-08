// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { ActionIcon, Anchor, Badge, Code, CopyButton, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import type { IntegrationOverview } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

const numberPath = '/service/sip-accounts/{kind}/{external_id}';

/** Ready-made calls of the service API with the public address filled in, each with a copy button. */
export function EndpointsSection({ overview }: { overview: IntegrationOverview }) {
  const { t } = useLang();
  const copy = t.integration.endpoints;
  const base = overview.api_base_url || '/api/v1';

  const endpoints = [
    { method: 'PUT', path: numberPath, body: '{"name": "…"}', purpose: copy.items.ensure },
    { method: 'GET', path: numberPath, purpose: copy.items.read },
    { method: 'PUT', path: numberPath, body: '{"rotate_password": true}', purpose: copy.items.rotate },
    { method: 'DELETE', path: numberPath, purpose: copy.items.disable },
    { method: 'GET', path: `${numberPath}/registration`, purpose: copy.items.registration },
  ];

  const curlExample = [
    `curl -X PUT "${base}/service/sip-accounts/CLIENT/1234567890" \\`,
    `  -H "X-SERVICE-TOKEN: <token>" -H "Content-Type: application/json" \\`,
    `  -d '{"name": "Mayakovskogo 14, flat 11"}'`,
  ].join('\n');

  return (
    <section className="tvx-section">
      <h2 className="tvx-section__title" style={{ marginBottom: 8 }}>
        {copy.title}
      </h2>
      <Text size="sm" c="dimmed" maw={720} mb="md">
        {copy.lede}
      </Text>

      <Stack gap={0}>
        <FactRow label={copy.apiBaseUrl} value={overview.api_base_url || null} fallback={copy.apiBaseUrlUnknown} />
        <FactRow label={copy.sipDomain} value={overview.sip_domain} />
      </Stack>

      <Text size="sm" c="dimmed" maw={720} mt="md" mb="md">
        {copy.kinds}
      </Text>

      <Stack gap="sm">
        {endpoints.map((endpoint, index) => (
          <Group key={index} gap="sm" wrap="nowrap" align="flex-start">
            <Badge variant="outline" color="gray" w={76} style={{ flexShrink: 0 }}>
              {endpoint.method}
            </Badge>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Group gap={6} wrap="nowrap">
                <Code fz="sm" style={{ overflowWrap: 'anywhere' }}>
                  {base}
                  {endpoint.path}
                </Code>
                <CopyValue value={`${base}${endpoint.path}`} label={endpoint.method} />
              </Group>
              <Text size="sm" c="dimmed">
                {endpoint.purpose}
                {endpoint.body && (
                  <>
                    {' '}
                    <Code fz="xs">{endpoint.body}</Code>
                  </>
                )}
              </Text>
            </div>
          </Group>
        ))}
      </Stack>

      <Text size="sm" fw={500} mt="lg" mb={4}>
        {copy.example}
      </Text>
      <Group gap={6} wrap="nowrap" align="flex-start">
        <Code block fz="sm" style={{ flex: 1, minWidth: 0 }}>
          {curlExample}
        </Code>
        <CopyValue value={curlExample} label={copy.example} />
      </Group>
      <Text size="sm" mt="md">
        <Anchor href={`${base}/docs`} target="_blank" rel="noreferrer">
          {copy.openApi}
        </Anchor>
      </Text>
    </section>
  );
}

function FactRow({ label, value, fallback }: { label: string; value: string | null; fallback?: string }) {
  return (
    <div className="tvx-row">
      <span className="tvx-row__lbl">{label}</span>
      <span className="tvx-row__val">
        {value ? (
          <Group gap={6} wrap="nowrap" justify="flex-end">
            <Code fz="sm">{value}</Code>
            <CopyValue value={value} label={label} />
          </Group>
        ) : (
          <Text component="span" size="sm" c="dimmed">
            {fallback}
          </Text>
        )}
      </span>
    </div>
  );
}

/** The console's copy button, as in the credentials window. */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const { t } = useLang();

  return (
    <CopyButton value={value}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? t.common.copied : t.common.copy}>
          <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} aria-label={t.common.copyValue(label)}>
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}
