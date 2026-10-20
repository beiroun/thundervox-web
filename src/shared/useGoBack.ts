// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * "Back" of a card: one step of history when the card was opened from inside the console – the list's selection
 * lives in its address, so the same search, sort and page come back; opened from outside (a link in a messenger,
 * a new tab) – to the list itself.
 */
export function useGoBack(listPath: string): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  const openedFromInside = location.key !== 'default';

  return useCallback(() => {
    void (openedFromInside ? navigate(-1) : navigate(listPath));
  }, [listPath, navigate, openedFromInside]);
}
