// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect } from 'react';
import { useMatches } from 'react-router';

import { useLang } from '@/i18n/LangContext';
import type { Copy } from '@/i18n/dict';

export type PageKey = keyof Copy['pages'];

/** What a route contributes to the document title, set as its `handle` in the router: the page's copy key. */
export interface RouteTitleHandle {
  page?: PageKey;
}

export function pageHandle(page: PageKey): RouteTitleHandle {
  return { page };
}

/**
 * Keeps document.title in step with the matched route and the language: "<page> · <console name>".
 *
 * A single-page application never reloads, so the browser tab, the history entries and a bookmark would all
 * read the same name without this; the deepest matched route that declares a page wins.
 */
export function useDocumentTitle(): void {
  const matches = useMatches();
  const { t } = useLang();

  useEffect(() => {
    const deepestPage = matches
      .map((match) => (match.handle as RouteTitleHandle | undefined)?.page)
      .filter((page): page is PageKey => Boolean(page))
      .at(-1);

    document.title = deepestPage ? `${t.pages[deepestPage].title} · ${t.consoleName}` : t.consoleName;
  }, [matches, t]);
}
