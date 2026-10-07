// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/BrandMark/BrandMark';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle/LanguageToggle';
import { useLang } from '@/i18n/LangContext';
import { brand } from '@/shared/brand';
import { routePaths } from '@/shared/navigation';

interface ConsoleHeaderProps {
  /** Opens the navigation drawer on a phone; the login page has none. */
  burger?: ReactNode;
}

/**
 * The top bar of every page, spanning the full width above the side column: the mark with the wordmark and the
 * byline at the left edge, language and theme right after them. The navigation and the operator live in the
 * side column (AppLayout), not here.
 */
export function ConsoleHeader({ burger }: ConsoleHeaderProps) {
  const { t } = useLang();

  return (
    <div className="tvx-topbar">
      <div className="tvx-header">
        <div className="tvx-header__left">
          {burger}
          <Link to={routePaths.dashboard} className="tvx-brandmark" aria-label={brand.product}>
            <BrandMark className="tvx-brandmark__icon" />
            <span className="tvx-wordmark">{brand.product}</span>
            <span className="tvx-byline">{t.byline}</span>
          </Link>
        </div>
        <div className="tvx-header__actions">
          <LanguageToggle />
          <ColorSchemeToggle />
        </div>
      </div>
    </div>
  );
}
