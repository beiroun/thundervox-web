// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect } from 'react';
import { useMatches } from 'react-router';

/** Product name of this application; the suffix of every document title and the fallback when a route has none. */
export const consoleName = 'ThunderVox Console';

/** What a route contributes to the document title, set as its `handle` in the router. */
export interface RouteTitleHandle {
  title?: string;
}

/**
 * Keeps document.title in step with the matched route.
 *
 * A single-page application never reloads, so the browser tab, the history entries and a bookmark would all
 * read the same name without this; the deepest matched route that declares a title wins.
 */
export function useDocumentTitle(): void {
  const matches = useMatches();

  useEffect(() => {
    const deepestTitle = matches
      .map((match) => (match.handle as RouteTitleHandle | undefined)?.title)
      .filter((title): title is string => Boolean(title))
      .at(-1);

    document.title = deepestTitle ? `${deepestTitle} – ${consoleName}` : consoleName;
  }, [matches]);
}
