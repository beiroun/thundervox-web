// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

/**
 * Smart search, one rule for every table of the console and for the server's journals (SmartQuery.kt): lower case
 * and `ё → е`; a query of digits, `+ - ( ) .` and spaces is one number (a phone typed with brackets); otherwise
 * words split by spaces, commas and `;`, a word of digits with punctuation keeps only the digits; at most six
 * words, at least one of them three characters long, the whole query at most 100. A row matches when every word
 * is part of its document (all its searchable fields glued); a one-word query equal to a key of the row puts that
 * row first. Lists held in memory apply it here, paged journals send the raw text and the server applies it.
 */

export const smartQueryMinWordLength = 3;
export const smartQueryMaxLength = 100;
const smartQueryMaxWords = 6;

export interface SmartQuery {
  /** Normalized words; a row matches when its document contains every one of them. */
  words: string[];
  /** The single word of a one-word query: a row whose key equals it goes first. */
  exactCandidate: string | null;
}

/** Why a typed query is not applied, for the hint under the field. */
export type SmartQueryProblem = 'tooShort' | 'tooLong';

const phoneLikeQuery = /^[\d+\-().\s]+$/;
const digitsWithPunctuation = /^[\d+\-().]+$/;
const wordSeparators = /[\s,;]+/;
const nonDigits = /\D/g;

export const normalizeSearchText = (text: string): string => text.toLowerCase().replace(/ё/g, 'е');

function wordsOf(normalized: string): string[] {
  if (phoneLikeQuery.test(normalized)) {
    return [normalized.replace(nonDigits, '')].filter(Boolean);
  }
  const words = normalized
    .split(wordSeparators)
    .map((word) => (digitsWithPunctuation.test(word) ? word.replace(nonDigits, '') : word))
    .filter(Boolean);
  return [...new Set(words)].slice(0, smartQueryMaxWords);
}

/** The parsed query, or null when there is nothing to search by (empty, too long, every word too short). */
export function parseSmartQuery(raw: string | null | undefined): SmartQuery | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed || trimmed.length > smartQueryMaxLength) {
    return null;
  }
  const words = wordsOf(normalizeSearchText(trimmed));
  if (!words.some((word) => word.length >= smartQueryMinWordLength)) {
    return null;
  }
  return { words, exactCandidate: words.length === 1 ? (words[0] ?? null) : null };
}

/** What to tell the operator under the field, or null when the query is fine or empty. */
export function smartQueryProblem(raw: string | null | undefined): SmartQueryProblem | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length > smartQueryMaxLength) {
    return 'tooLong';
  }
  return parseSmartQuery(trimmed) ? null : 'tooShort';
}

/** The query a paged journal may send: the trimmed text, or nothing when the server would refuse it. */
export function sendableSearchQuery(raw: string | null | undefined): string | undefined {
  return parseSmartQuery(raw) ? (raw ?? '').trim() : undefined;
}

type SearchField = string | number | null | undefined;

const nonDigitsKeepingSpaces = /[^\d\s]+/g;

/**
 * The normalized document of a row: every searchable field glued, followed by the same text with everything but
 * digits and spaces removed. The query turns "178.74.67.30" into the digits 178746730 (the rule is made for phones
 * typed with dots and dashes), so a panel at 178.74.67.30:5060 is found through the digit copy 1787467305060; the
 * server builds its documents the same way.
 */
export function smartSearchDocument(...fields: SearchField[]): string {
  const text = normalizeSearchText(fields.filter((field) => field != null && field !== '').join(' '));
  return `${text} ${text.replace(nonDigitsKeepingSpaces, '')}`;
}

export function matchesSmartQuery(query: SmartQuery, document: string): boolean {
  return query.words.every((word) => document.includes(word));
}

/** True when the one-word query equals one of the row's keys (number, external id, login) – such rows go first. */
export function isExactSmartMatch(query: SmartQuery, keys: SearchField[]): boolean {
  return (
    query.exactCandidate !== null &&
    keys.some((key) => key != null && normalizeSearchText(String(key).trim()) === query.exactCandidate)
  );
}
