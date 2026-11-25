// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { brand } from '@/shared/brand';

/*
 * The 84softworks mark (brand/marks/84softworks in 84softworks-design): the navy disc with "84" and the
 * "softworks" arc, ringed in orange so the disc still reads on the dark DevTools theme. Each PAINT letter colours
 * the MARK cell above it: n – navy disc, o – orange ring, N/O – their half-cell edges, b – orange lettering on the disc.
 */
const MARK = [
  '                     ▄▄▄▄▄▄▄▄▄▄▄▄',
  '               ▄▄▄      ▀▀▀▀▀▀      ▄▄▄',
  '            ▄▄   ▀▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀▀   ▄▄',
  '          ▄   ▀ ▄▄                  ▄▄ ▀   ▄',
  '           ▀ ▄                          ▄ ▀   ',
  '      ▄  ▀ ▄                              ▄ ▀  ▄',
  '         ▄                                  ▄    ',
  '   ▄  ▀                                        ▀  ▄',
  '     ▀                                          ▀  ',
  '                 ▄███████▄      ▄████               ',
  ' ▄               ███   ███    ▄██▀███               ▄',
  '                  ███████   ▄██▀  ███                ',
  '                 ███   ███  █████████                ',
  '                 ▀███████▀        ███                ',
  '               s                       s             ',
  '                  o  f           r  k                ',
  ' ▀                      t  w  o                     ▀',
  '                                                    ',
  '     ▄                                          ▄  ',
  '   ▀  ▄                                        ▄  ▀',
  '         ▀                                  ▀    ',
  '      ▀  ▄ ▀                              ▀ ▄  ▀',
  '           ▄ ▀                          ▀ ▄   ',
  '          ▀   ▄ ▀▀                  ▀▀ ▄   ▀',
  '            ▀▀   ▄▄▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄▄▄   ▀▀',
  '               ▀▀▀      ▄▄▄▄▄▄      ▀▀▀',
  '                     ▀▀▀▀▀▀▀▀▀▀▀▀',
];

const PAINT = [
  '                     OOOOOOOOOOOO',
  '               OOOooooooOOOOOOooooooOOO',
  '            OOoooOOONNNNNNNNNNNNNNOOOoooOO',
  '          OoooO NNnnnnnnnnnnnnnnnnnnNN OoooO',
  '        oooO NnnnnnnnnnnnnnnnnnnnnnnnnnnN Oooo',
  '      OooO NnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnN OooO',
  '     ooo NnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnN ooo',
  '   OooO nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn OooO',
  '   ooO nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn Ooo',
  '  ooo nnnnnnnnnnnbbbbbbbbbnnnnnnbbbbbnnnnnnnnnnn ooo',
  ' Ooo nnnnnnnnnnnnbbbnnnbbbnnnnbbbbbbbnnnnnnnnnnnn ooO',
  ' ooo nnnnnnnnnnnnnbbbbbbbnnnbbbbnnbbbnnnnnnnnnnnn ooo',
  ' oo  nnnnnnnnnnnnbbbnnnbbbnnbbbbbbbbbnnnnnnnnnnnn  oo',
  ' oo  nnnnnnnnnnnnbbbbbbbbbnnnnnnnnbbbnnnnnnnnnnnn  oo',
  ' oo  nnnnnnnnnnbnnnnnnnnnnnnnnnnnnnnnnnbnnnnnnnnn  oo',
  ' ooo nnnnnnnnnnnnnbnnbnnnnnnnnnnnbnnbnnnnnnnnnnnn ooo',
  ' Ooo nnnnnnnnnnnnnnnnnnnbnnbnnbnnnnnnnnnnnnnnnnnn ooO',
  '  ooo nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn ooo',
  '   ooO nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn Ooo',
  '   OooO nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn OooO',
  '     ooo NnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnN ooo',
  '      OooO NnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnN OooO',
  '        oooO NnnnnnnnnnnnnnnnnnnnnnnnnnnN Oooo',
  '          OoooO NNnnnnnnnnnnnnnnnnnnNN OoooO',
  '            OOoooOOONNNNNNNNNNNNNNOOOoooOO',
  '               OOOooooooOOOOOOooooooOOO',
  '                     OOOOOOOOOOOO',
];

const NAVY = '#212842';
const ORANGE = '#dd5410';
const CELL = 'font-family: monospace; font-size: 12px; line-height: 1;';
const CELL_STYLES: Record<string, string> = {
  n: `${CELL} background: ${NAVY};`,
  o: `${CELL} background: ${ORANGE};`,
  N: `${CELL} color: ${NAVY};`,
  O: `${CELL} color: ${ORANGE};`,
  b: `${CELL} color: ${ORANGE}; background: ${NAVY}; font-weight: bold;`,
};
// No colour: the credits must read on both the light and the dark DevTools theme
const CAPTION_STYLE = 'font-family: monospace; line-height: 1.6;';

/** Prints the 84softworks mark and the credits to the browser console; called once per page load. */
export function printConsoleBanner(): void {
  let format = '';
  const styles: string[] = [];
  MARK.forEach((row, y) => {
    const paint = PAINT[y] ?? '';
    let start = 0;
    while (start < row.length) {
      const kind = paint.charAt(start);
      let end = start + 1;
      while (end < row.length && paint.charAt(end) === kind) end += 1;
      format += `%c${row.slice(start, end)}`;
      styles.push(CELL_STYLES[kind] ?? CELL);
      start = end;
    }
    format += '\n';
  });
  console.log(`${format}%c\nDeveloped by ${brand.organization}\n${brand.websiteLabel}`, ...styles, CAPTION_STYLE);
}
