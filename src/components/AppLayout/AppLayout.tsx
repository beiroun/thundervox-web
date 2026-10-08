// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useState } from 'react';
import { AppShell, Burger } from '@mantine/core';
import { NavLink, Outlet, useLocation } from 'react-router';

import { useGetCurrentUserQuery } from '@/api/authApi';
import { ConsoleFooter } from '@/components/ConsoleFooter/ConsoleFooter';
import { ConsoleHeader } from '@/components/ConsoleHeader/ConsoleHeader';
import { useLang } from '@/i18n/LangContext';
import { navigationItems } from '@/shared/navigation';
import { useDocumentTitle } from '@/shared/documentTitle';
import { currentUserRefreshed } from '@/store/AuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

/**
 * Shell of every page behind the login: the top bar with the mark, the operator, the log-out, language and
 * theme; the primary navigation in the left column with the versions and the maker at its foot (a drawer under
 * the bar on a phone); the page itself in the editorial body.
 */
export function AppLayout() {
  const dispatch = useAppDispatch();
  const { t } = useLang();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  // The role stored with the session may be stale (changed by an administrator since login): ask once per visit
  const { data: freshUser } = useGetCurrentUserQuery();
  const [mobileNavOpened, setMobileNavOpened] = useState(false);

  useDocumentTitle();

  useEffect(() => {
    if (freshUser) {
      dispatch(currentUserRefreshed(freshUser));
    }
  }, [dispatch, freshUser]);

  // A tap on a drawer link navigates; the drawer must not stay over the new page
  useEffect(() => {
    setMobileNavOpened(false);
  }, [location.pathname]);

  const visibleItems = navigationItems.filter((item) => !item.visibleTo || (user && item.visibleTo(user.role)));

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !mobileNavOpened } }}
      padding={0}
    >
      {/* zIndex above the navbar's (Mantine gives the column 101 and the header 100): the bar's hairline must run
          over the column's edge too, or a fractional browser zoom lets the column eat the bar's last pixel row */}
      <AppShell.Header withBorder={false} className="tvx-topbar" zIndex={102}>
        <ConsoleHeader
          burger={
            <Burger
              opened={mobileNavOpened}
              onClick={() => setMobileNavOpened((opened) => !opened)}
              hiddenFrom="sm"
              size="sm"
              color="var(--tvx-topbar-fg)"
              aria-label={t.nav.menu}
            />
          }
        />
      </AppShell.Header>

      <AppShell.Navbar withBorder={false} className="tvx-sidenav">
        <nav className="tvx-sidenav__links">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {t.nav[item.labelKey]}
            </NavLink>
          ))}
        </nav>
        <ConsoleFooter stacked />
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="tvx-wrap tvx-page">
          <div className="tvx-page__body">
            <Outlet />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
