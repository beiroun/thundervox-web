// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Alert, Loader, Stack } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useGetIntegrationQuery } from '@/api/integrationApi';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import { DeliveryLogSection } from '@/pages/Integration/DeliveryLogSection';
import { EndpointsSection } from '@/pages/Integration/EndpointsSection';
import { PushSettingsSection } from '@/pages/Integration/PushSettingsSection';
import { ServiceTokensSection } from '@/pages/Integration/ServiceTokensSection';
import { mayChangeIntegration } from '@/shared/consoleRoles';
import { useAppSelector } from '@/store/store';

/**
 * The seam with the operator's backend in one place: who may call the service API (tokens), what to call
 * (endpoint links), where the wake push goes (settings and a test), and what happened to every push (log).
 * Administrators read and test; the super administrator changes.
 */
export function Integration() {
  const { t } = useLang();
  const me = useAppSelector((state) => state.auth.user);
  const mayChange = me ? mayChangeIntegration(me.role) : false;
  const { data: overview, isLoading, error } = useGetIntegrationQuery();

  return (
    <Stack gap="lg">
      <PageHeader page={t.pages.integration} />

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}

      <ServiceTokensSection mayChange={mayChange} />
      {overview && <EndpointsSection overview={overview} />}
      {overview && <PushSettingsSection overview={overview} mayChange={mayChange} />}
      <DeliveryLogSection />
    </Stack>
  );
}
