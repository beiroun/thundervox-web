// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import { routePaths } from '@/shared/navigation';

export function NotFound() {
  return (
    <Stack gap="xs">
      <Title order={2}>Page not found</Title>
      <Text c="dimmed">There is nothing at this address.</Text>
      <Anchor component={Link} to={routePaths.dashboard}>
        Back to the dashboard
      </Anchor>
    </Stack>
  );
}
