// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { dict, type Copy, type Lang } from '@/i18n/dict';

interface LangState {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Copy of the active language. */
  t: Copy;
}

const storageKey = 'thundervox.console.lang';
const LangContext = createContext<LangState | null>(null);

/** The operator's explicit choice wins; a first visit follows the browser locale, where anything ru-* is Russian. */
function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'en' || stored === 'ru') {
      return stored;
    }
  } catch {
    // Storage blocked: the locale decides on every load
  }
  const locale = navigator.language?.toLowerCase() ?? 'en';
  return locale.startsWith('ru') ? 'ru' : 'en';
}

/** Holds the console language, persists the choice and keeps <html lang> in step for the browser and screen readers. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangState>(
    () => ({
      lang,
      t: dict[lang],
      setLang: (next) => {
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // Storage blocked: the choice lasts until the tab is reloaded
        }
        setLangState(next);
      },
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
}
