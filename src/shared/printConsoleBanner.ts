// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { brand } from '@/shared/brand';

/*
 * The 84softworks mark (brand/marks/84softworks in 84softworks-design). "SOFTWORKS" is typed as real letters, one per
 * cell, and sets the scale: the disc, the "84" and the wave are measured from it in the icon's proportions, two
 * pixels per cell; an orange ring outside the disc keeps it visible on the dark DevTools theme. One character per
 * cell: an uppercase letter is itself, any other is the colour of the cell's top and bottom half (HALVES).
 * Built by scripts/console-banner in the Tark mirror.
 */
const LOGO = [
  '         ccoooodddoooocc',
  '      cooddaannnnnnnaaddooc',
  '    coodannnnnnnnnnnnnnnadooc',
  '   oodannnnnnnnnnnnnnnnnnnadoo',
  '  oo nnnneeeeennnnnneeennnnn oo',
  ' oo nnnnoonnnoonnneofoonnnnnn oo',
  ' ooannnneofffoeneofnnoonnnnnnaoo',
  ' o nnnnnoonnnoonfffffoofnnnnnn o',
  ' o nnnnnnfffffnnnnnnnffnnnnnnn o',
  ' oobnnnnSnnnnnnnWnnnnnnnSnnnnboo',
  ' oo nnnnnnOnnnTnnnOnnnKnnnnnn oo',
  '  oo nnnnnnnFnnnnnnnRnnnnnnn oo',
  '   oocbnnnnnnnnnnnnnnnnnnnbcoo',
  '    doocbnnnnnnnnnnnnnnnbcood',
  '      dooccbbnnnnnnnbbccood',
  '         ddoooocccoooodd',
];

const NAVY = '#212842';
const ORANGE = '#dd5410';
const PAGE = 'transparent';
/** Cell code -> [top half, bottom half]. */
const HALVES: Record<string, [string, string]> = {
  n: [NAVY, NAVY],
  o: [ORANGE, ORANGE],
  a: [PAGE, NAVY],
  b: [NAVY, PAGE],
  c: [PAGE, ORANGE],
  d: [ORANGE, PAGE],
  e: [NAVY, ORANGE],
  f: [ORANGE, NAVY],
};

// line-height = Menlo's full height (ascent + descent = 1.164em): the backgrounds of the rows meet with no seam,
// and 13px keeps the line taller than the console's own. Halves are a background split exactly in the middle,
// not half-block glyphs - DevTools draws those shorter than the line, so they never meet the next cell.
const CELL = 'font-family: Menlo, Consolas, monospace; font-size: 13px; line-height: 1.164;';
const LETTER_STYLE = `${CELL} color: ${ORANGE}; background: ${NAVY}; font-weight: bold;`;
// No colour: the credits must read on both the light and the dark DevTools theme
const CAPTION_STYLE = 'font-family: monospace; line-height: 1.6;';

function cellStyle(code: string): string {
  if (code >= 'A' && code <= 'Z') return LETTER_STYLE;
  const halves = HALVES[code];
  if (!halves) return CELL;
  const [top, bottom] = halves;
  return `${CELL} background: linear-gradient(${top} 50%, ${bottom} 50%);`;
}

/** Prints the 84softworks mark and the credits to the browser console; called once per page load. */
export function printConsoleBanner(): void {
  let format = '';
  const styles: string[] = [];
  for (const row of LOGO) {
    let start = 0;
    while (start < row.length) {
      const code = row.charAt(start);
      let end = start + 1;
      // A run of identical cells is one span; letters always stand alone
      while (end < row.length && row.charAt(end) === code && !(code >= 'A' && code <= 'Z')) end += 1;
      const text = code >= 'A' && code <= 'Z' ? code : ' '.repeat(end - start);
      format += `%c${text}`;
      styles.push(cellStyle(code));
      start = end;
    }
    format += '\n';
  }
  console.log(`${format}%c\nDeveloped by ${brand.organization}\n${brand.websiteLabel}`, ...styles, CAPTION_STYLE);
}
