// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect } from 'react';
import { ActionIcon, AppShell, Badge, Group, NavLink, Text, Title, Tooltip } from '@mantine/core';
import { IconBolt, IconLogout } from '@tabler/icons-react';
import { NavLink as RouterNavLink, Outlet } from 'react-router';

import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { useGetCurrentUserQuery } from '@/api/authApi';
import { currentUserRefreshed, sessionEnded } from '@/store/AuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { navigationItems } from '@/shared/navigation';
import { consoleRoleColors, consoleRoleTitles } from '@/shared/consoleRoles';
import { useDocumentTitle } from '@/shared/documentTitle';

/** Shell of every page behind the login: header with versions and the operator, role-aware navigation, outlet. */
export function AppLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data: platformInfo } = useGetPlatformInfoQuery();
  // The role stored with the session may be stale (changed by an administrator since login): ask once per visit
  const { data: freshUser } = useGetCurrentUserQuery();

  useDocumentTitle();

  useEffect(() => {
    if (freshUser) {
      dispatch(currentUserRefreshed(freshUser));
    }
  }, [dispatch, freshUser]);

  const visibleItems = navigationItems.filter((item) => !item.visibleTo || (user && item.visibleTo(user.role)));

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <IconBolt size={22} />
            <Title order={4}>ThunderVox</Title>
            <Text size="sm" c="dimmed">
              console {import.meta.env.VITE_APP_VERSION ?? 'dev'}
            </Text>
            {platformInfo && (
              <Badge variant="light" size="sm">
                server {platformInfo.version}
              </Badge>
            )}
          </Group>
          {user && (
            <Group gap="sm">
              <Text size="sm" fw={600}>
                {user.login}
              </Text>
              <Badge variant="light" color={consoleRoleColors[user.role]}>
                {consoleRoleTitles[user.role]}
              </Badge>
              <Tooltip label="Log out">
                <ActionIcon variant="subtle" aria-label="Log out" onClick={() => dispatch(sessionEnded())}>
                  <IconLogout size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {visibleItems.map((item) => (
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
