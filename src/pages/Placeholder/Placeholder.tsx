// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Stack, Text, Title } from '@mantine/core';

/** Stands in for a page whose server API does not exist yet; replaced page by page as the API lands. */
export function Placeholder({ title }: { title: string }) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      <Text c="dimmed">This page appears together with the corresponding server API.</Text>
    </Stack>
  );
}
