// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { describeApiError } from '@/api/baseQuery';
import { useLogInMutation } from '@/api/authApi';
import { ConsoleFooter } from '@/components/ConsoleFooter/ConsoleFooter';
import { ConsoleHeader } from '@/components/ConsoleHeader/ConsoleHeader';
import type { LoginRedirectState } from '@/components/RequireSession/RequireSession';
import { useLang } from '@/i18n/LangContext';
import { routePaths } from '@/shared/navigation';
import { useDocumentTitle } from '@/shared/documentTitle';
import { sessionStarted } from '@/store/AuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

/** Login form under the top bar; on success returns the operator to the page that sent them here. */
export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const token = useAppSelector((state) => state.auth.token);
  const [logIn, { isLoading, error }] = useLogInMutation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useDocumentTitle();

  const returnTo = (location.state as LoginRedirectState | null)?.from ?? routePaths.dashboard;

  if (token) {
    return <Navigate to={returnTo} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await logIn({ login: login.trim(), password }).unwrap();
      dispatch(sessionStarted({ token: response.token, user: response.user }));
      navigate(returnTo, { replace: true });
    } catch {
      // The error is rendered from the mutation state below
    }
  };

  return (
    <>
      <ConsoleHeader />
      <div className="tvx-wrap tvx-wrap--centered tvx-page">
        <div className="tvx-page__body">
          <div className="tvx-login">
            <div className="tvx-kicker">{t.pages.login.kicker}</div>
            <h1 className="tvx-title">{t.pages.login.title}</h1>
            <form className="tvx-login__card" onSubmit={submit}>
              <Stack gap="md">
                <TextInput
                  label={t.login.login}
                  value={login}
                  onChange={(event) => setLogin(event.currentTarget.value)}
                  autoComplete="username"
                  required
                  autoFocus
                />
                <PasswordInput
                  label={t.login.password}
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  autoComplete="current-password"
                  required
                />
                {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
                <Button type="submit" loading={isLoading} fullWidth>
                  {t.login.submit}
                </Button>
              </Stack>
            </form>
          </div>
        </div>
        <ConsoleFooter />
      </div>
    </>
  );
}
