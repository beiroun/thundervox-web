// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Center, Group, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { describeApiError } from '@/api/baseQuery';
import { useLogInMutation } from '@/api/authApi';
import { sessionStarted } from '@/store/AuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { routePaths } from '@/shared/navigation';
import { useDocumentTitle } from '@/shared/documentTitle';
import type { LoginRedirectState } from '@/components/RequireSession/RequireSession';

/** Login form; on success returns the operator to the page that sent them here. */
export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
    <Center mih="100vh" p="md">
      <Paper withBorder shadow="sm" p="xl" w={360}>
        <form onSubmit={submit}>
          <Stack gap="md">
            <Group gap="xs">
              <IconBolt size={24} />
              <Title order={3}>ThunderVox Console</Title>
            </Group>
            <TextInput
              label="Login"
              value={login}
              onChange={(event) => setLogin(event.currentTarget.value)}
              autoComplete="username"
              required
              autoFocus
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              autoComplete="current-password"
              required
            />
            {error && <Alert color="red">{describeApiError(error)}</Alert>}
            <Button type="submit" loading={isLoading} fullWidth>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
