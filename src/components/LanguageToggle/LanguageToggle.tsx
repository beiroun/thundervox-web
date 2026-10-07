// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useLang } from '@/i18n/LangContext';
import type { Lang } from '@/i18n/dict';

// RU first: the operators and the devices they provision are Russian
const options: Lang[] = ['ru', 'en'];

/** RU / EN pill in the header band, the landing's toggle; the active segment is inverted to white. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="tvx-langtoggle" role="group" aria-label={t.header.language}>
      {options.map((code) => (
        <button
          key={code}
          type="button"
          className={lang === code ? 'is-active' : undefined}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
