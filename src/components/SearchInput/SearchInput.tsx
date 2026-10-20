// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Box, CloseButton, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';
import { sendableSearchQuery, smartQueryMaxLength, smartQueryProblem } from '@/shared/smartQuery';

/** A pause in typing this long applies the query. */
const applyDelayMs = 400;

interface SearchInputProps {
  /** The applied query (from the address). */
  value: string | undefined;
  /** The trimmed query, or undefined when the field is empty or the query is too short to search by. */
  onChange: (value: string | undefined) => void;
  /** An honest list of what the search looks at, "partial works" where it does. */
  placeholder: string;
  w?: number | string;
}

/**
 * The smart search of a table: applies after a pause in typing, at once on Enter, clears on Esc and on the cross.
 * The draft lives in the field, the address holds only what was applied; why a query does not search (too short,
 * too long) shows in a tooltip under the field, so the toolbar never jumps.
 */
export function SearchInput({ value, onChange, placeholder, w = 400 }: SearchInputProps) {
  const { t } = useLang();
  const [draft, setDraft] = useState(value ?? '');
  const [syncedValue, setSyncedValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  // The draft is overwritten only by an external change (reset, a link): otherwise the trimmed debounce would eat
  // a typed space, and a too-short draft (applied as no query) would be wiped
  if (value !== syncedValue) {
    setSyncedValue(value);
    if ((value ?? '') !== (sendableSearchQuery(draft) ?? '')) {
      setDraft(value ?? '');
    }
  }

  const commit = useDebouncedCallback((next: string) => onChange(sendableSearchQuery(next)), applyDelayMs);

  const applyNow = (next: string) => {
    commit.cancel();
    onChange(sendableSearchQuery(next));
  };

  const clear = () => {
    setDraft('');
    applyNow('');
  };

  const problem = smartQueryProblem(draft);
  const hint = problem === null ? null : t.search[problem];

  return (
    <Box onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} w={w} maw="100%">
      <Tooltip label={hint} opened={hint !== null && (focused || hovered)} position="bottom-start" fz="xs">
        <TextInput
          aria-label={t.search.label}
          placeholder={placeholder}
          maxLength={smartQueryMaxLength}
          leftSection={<IconSearch size={16} />}
          value={draft}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
            commit(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              applyNow(draft);
            } else if (event.key === 'Escape' && draft) {
              clear();
            }
          }}
          rightSection={draft ? <CloseButton size="md" aria-label={t.search.clear} onClick={clear} /> : null}
        />
      </Tooltip>
    </Box>
  );
}
