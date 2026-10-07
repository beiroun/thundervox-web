// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

/**
 * Light / dark switch in the top bar. The first visit follows the operating system; a click fixes the
 * choice in this browser (Mantine persists it in localStorage and applies it before React mounts via the
 * script in index.html, so a dark console never flashes white).
 */
export function ColorSchemeToggle() {
  const { t } = useLang();
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  const label = computed === 'dark' ? t.header.lightScheme : t.header.darkScheme;

  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="transparent"
        className="tvx-topbar-iconbtn"
        aria-label={label}
        onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
      >
        {computed === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
