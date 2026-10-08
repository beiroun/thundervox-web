// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Combobox,
  createTheme,
  DEFAULT_THEME,
  Input,
  InputWrapper,
  Menu,
  Modal,
  NavLink,
  Paper,
  SegmentedControl,
  Table,
  Title,
  Tooltip,
  virtualColor,
  type MantineColorsTuple,
} from '@mantine/core';

/*
 * Every colour of the console is a virtualColor: one tuple for the light scheme, another for the dark one.
 * Mantine reads a tuple by index and reads different indexes per scheme (default-css-variables-resolver): in the
 * light scheme index 6 is text, outline and fill, 1 and 2 the "light" backgrounds, 9 the "light" text; in the dark
 * scheme index 0 is the "light" text, 1 the outline, 4 text and anchors, 5 the fill, 6 its hover, 8 the semantic
 * error/success value and the "light" background is index 9 darkened by half. One tuple cannot serve both canvases:
 * the brand navy is the dark canvas itself, and the old near-black "light" washes vanished on it. The light tuples
 * are the landing's palette; the dark tuples are assembled from named roles for the navy canvas (#212842).
 */

/** Slate navy of the 84softworks band on the white canvas; index 6 is the brand value #212842. */
const brandLight: MantineColorsTuple = [
  '#eef0f6',
  '#dbdfeb',
  '#b9c0d6',
  '#949fc0',
  '#6a79a3',
  '#3f4d7c',
  '#212842',
  '#1a2036',
  '#14182a',
  '#0e111e',
];

/** Warm orange accent on the white canvas; index 6 is the brand value #dd5410. */
const accentLight: MantineColorsTuple = [
  '#fff1ea',
  '#ffdcc9',
  '#ffb892',
  '#ff955c',
  '#f87a36',
  '#ea6420',
  '#dd5410',
  '#c2410c',
  '#a1360b',
  '#7f2b09',
];

/**
 * Light-scheme neutrals, tuned so Mantine's semantic slots land on the landing's palette: index 4 (default
 * border) is the hairline #e5e7eb, index 5 (placeholder) the ash #a3a3a3, index 6 (dimmed) stays readable.
 */
const grayLight: MantineColorsTuple = [
  '#f9fafb',
  '#f3f4f6',
  '#eef0f3',
  '#e9ebef',
  '#e5e7eb',
  '#a3a3a3',
  '#767676',
  '#525252',
  '#404040',
  '#262626',
];

/**
 * Dark scheme built on the landing's hero band: the body (index 7) is the Slate navy #212842 itself; surfaces,
 * hover and borders are lighter steps of the same hue (HSL 227°). Mantine reads it by index: 0 text, 1 secondary
 * labels, 2 dimmed, 3 placeholder, 4 border, 5 hover, 6 surface, 7 body, 8 sunken track. Border and placeholder are
 * lifted above what the hue steps alone would give - on navy a divider at 1.5:1 disappears, 1.7:1 reads.
 */
const dark: MantineColorsTuple = [
  '#f2f3f7',
  '#d2d6e4',
  '#a3aac2',
  '#8690ad',
  '#404b78',
  '#303a5f',
  '#293251',
  '#212842',
  '#1a1f33',
  '#151929',
];

/** The slots Mantine reads from a colour tuple in the dark scheme, named. */
interface DarkSchemeColorRoles {
  /** Text of the "light" variant (badges, alerts): a tint readable on its own wash. */
  onWash: string;
  /** Border and text of the "outline" variant on the canvas. */
  outline: string;
  /** Text and anchors in this colour on the canvas and on paper. */
  text: string;
  /** Background of the "filled" variant (buttons). */
  filled: string;
  /** Hover of "filled" - on a dark canvas a hover lightens. Also the text of a coloured Menu.Item (index 6). */
  filledHover: string;
  /** What Mantine reads as the error (red) or success (teal) colour. */
  semantic: string;
  /** Background of the "light" variant: the hue mixed into the navy canvas, so the pill sits on it, not under it. */
  wash: string;
}

/** Mantine derives the "light" background as index 9 darkened by half, so index 9 carries the wash with doubled channels. */
function washSource(wash: string): string {
  const channels = [1, 3, 5].map((offset) => Math.min(255, parseInt(wash.slice(offset, offset + 2), 16) * 2));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Tuple for the dark scheme from its roles. Indexes 2, 3 and 7 are not read by any variant in the dark scheme and
 * repeat their neighbours; index 2 of "gray" is the one exception - Mantine paints the dark-scheme Tooltip with it,
 * and the light onWash tint gives the inverted tooltip the landing's active-pill look.
 */
function darkSchemeTuple(roles: DarkSchemeColorRoles): MantineColorsTuple {
  return [
    roles.onWash,
    roles.outline,
    roles.onWash,
    roles.outline,
    roles.text,
    roles.filled,
    roles.filledHover,
    roles.filledHover,
    roles.semantic,
    washSource(roles.wash),
  ];
}

/*
 * Dark roles: tints of the hue as it sits on white (onWash, outline, text, semantic) and the hue mixed into the
 * canvas (wash). Contrast on #212842: outline and text 5.4:1 and up, onWash on its wash 4.9:1 and up; the figures
 * come from the derivation in the console-brand-skin changelog, not from the eye.
 */

/** Orange of the accent on navy: text a step brighter than #dd5410 (3.7:1 on navy), fills unchanged. */
const accentDark = darkSchemeTuple({
  onWash: '#f1bb9f',
  outline: '#eb9c74',
  text: '#e78453',
  filled: '#ea6420',
  filledHover: '#f27a3c',
  semantic: '#e99064',
  wash: '#5d3632',
});

/** The brand on its own navy: a periwinkle, the navy lifted towards white, so a brand badge is not the canvas. */
const brandDark = darkSchemeTuple({
  onWash: '#ced6ff',
  outline: '#a5b3ff',
  text: '#96a6ff',
  filled: '#5a6ccf',
  filledHover: '#6b7cd9',
  semantic: '#a5b3ff',
  wash: '#485591',
});

/** Neutral on navy: the ash tinted with the canvas hue, never a grey that reads as dirt on blue. */
const grayDark = darkSchemeTuple({
  onWash: '#d9dbe5',
  outline: '#b0b6ca',
  text: '#b8bdcf',
  filled: '#5c6687',
  filledHover: '#6a7596',
  semantic: '#a4aac2',
  wash: '#454c66',
});

/** Danger on navy: a red a touch calmer than Mantine's, so it sits next to the orange accent without competing. */
const redDark = darkSchemeTuple({
  onWash: '#f4b2b4',
  outline: '#f09598',
  text: '#ee868a',
  filled: '#e04a50',
  filledHover: '#f07b80',
  semantic: '#ef9194',
  wash: '#643346',
});

/** Online / success on navy. */
const tealDark = darkSchemeTuple({
  onWash: '#a5e4d1',
  outline: '#71d4b6',
  text: '#59cdaa',
  filled: '#20b486',
  filledHover: '#2cc394',
  semantic: '#4dcaa4',
  wash: '#1c5658',
});

const fontFamily = "'Onest', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

/**
 * Console theme in the 84softworks skin: Onest at weight 400 everywhere, orange as the single accent, navy as a
 * second palette for badges, radius pill or none, no shadows, hairline borders. Page-level blocks (band, kicker,
 * metrics) are plain CSS in console.css; this file shapes Mantine's own components to the same rules.
 */
export const themeMantine = createTheme({
  fontFamily,
  fontFamilyMonospace: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  headings: { fontFamily, fontWeight: '400' },
  fontSmoothing: true,
  white: '#ffffff',
  black: '#0a0a0a',
  colors: {
    brandLight,
    brandDark,
    brand: virtualColor({ name: 'brand', light: 'brandLight', dark: 'brandDark' }),
    accentLight,
    accentDark,
    accent: virtualColor({ name: 'accent', light: 'accentLight', dark: 'accentDark' }),
    grayLight,
    grayDark,
    gray: virtualColor({ name: 'gray', light: 'grayLight', dark: 'grayDark' }),
    // Mantine's own red and teal stay on the light canvas; only their dark halves are ours
    redLight: DEFAULT_THEME.colors.red,
    redDark,
    red: virtualColor({ name: 'red', light: 'redLight', dark: 'redDark' }),
    tealLight: DEFAULT_THEME.colors.teal,
    tealDark,
    teal: virtualColor({ name: 'teal', light: 'tealLight', dark: 'tealDark' }),
    dark,
  },
  primaryColor: 'accent',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 0,
  // Two radii exist in the brand: pill (xl) and none - every other size collapses to none
  radius: { xs: '0', sm: '0', md: '0', lg: '0', xl: '9999px' },
  shadows: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  components: {
    Button: Button.extend({
      defaultProps: { radius: 'xl' },
      styles: { root: { fontWeight: 400, letterSpacing: 0 } },
    }),
    Badge: Badge.extend({
      // overflow visible on the root and the label: Mantine clips both and shows an ellipsis, which lets an
      // auto-layout table shrink a badge column below its text (a clipped grid item has no minimum width). Our
      // badges are short, fixed labels (SA, PANEL, ONLINE) that must never be cut - the text columns wrap instead.
      styles: {
        root: { fontWeight: 400, letterSpacing: '0.06em', overflow: 'visible' },
        label: { overflow: 'visible' },
      },
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: 'sm', highlightOnHover: true },
      styles: {
        th: {
          fontWeight: 400,
          fontSize: 'var(--tvx-text-caption)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--tvx-ash)',
        },
      },
    }),
    Card: Card.extend({ defaultProps: { withBorder: true, shadow: 'none', padding: 'lg' } }),
    Paper: Paper.extend({ defaultProps: { shadow: 'none' } }),
    Modal: Modal.extend({
      defaultProps: { centered: true, overlayProps: { backgroundOpacity: 0.45, blur: 2 } },
      styles: {
        content: { border: '1px solid var(--mantine-color-default-border)' },
        title: { fontSize: 'var(--tvx-text-subheading)', letterSpacing: '-0.55px' },
      },
    }),
    // Floating layers and fields on the dark canvas: without shadows a dropdown is told apart from the page only by
    // its surface, so it takes the paper; a field is sunken to the canvas, so it shows on paper (modals) as well
    Menu: Menu.extend({ styles: { dropdown: { backgroundColor: 'var(--tvx-paper)' } } }),
    Combobox: Combobox.extend({ styles: { dropdown: { backgroundColor: 'var(--tvx-paper)' } } }),
    Input: Input.extend({ styles: { input: { backgroundColor: 'var(--tvx-field)' } } }),
    Code: Code.extend({ styles: { root: { backgroundColor: 'var(--tvx-chip)' } } }),
    InputWrapper: InputWrapper.extend({ styles: { label: { fontWeight: 400 } } }),
    Title: Title.extend({ styles: { root: { letterSpacing: 'var(--tvx-tracking)' } } }),
    Alert: Alert.extend({ styles: { title: { fontWeight: 400 } } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: false } }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { radius: 'xl' },
      styles: { label: { fontWeight: 400 } },
    }),
    NavLink: NavLink.extend({ styles: { label: { fontSize: 'var(--tvx-text-nav)' } } }),
  },
});
