// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { AppShell, Badge, Group, NavLink, Text, Title } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { NavLink as RouterNavLink, Outlet } from 'react-router';

import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { navigationItems } from '@/shared/navigation';
import { useDocumentTitle } from '@/shared/documentTitle';

/** Shell of every page: header with the server version, sidebar navigation, page outlet. */
export function AppLayout() {
  const { data: platformInfo } = useGetPlatformInfoQuery();

  useDocumentTitle();

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <IconBolt size={22} />
            <Title order={4}>ThunderVox</Title>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              console {import.meta.env.VITE_APP_VERSION ?? 'dev'}
            </Text>
            {platformInfo && (
              <Badge variant="light" size="sm">
                server {platformInfo.version}
              </Badge>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            component={RouterNavLink}
            to={item.path}
            end={item.path === '/'}
            label={item.label}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
