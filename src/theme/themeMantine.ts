// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  Alert,
  Badge,
  Button,
  Card,
  createTheme,
  InputWrapper,
  Modal,
  NavLink,
  Paper,
  SegmentedControl,
  Table,
  Title,
  Tooltip,
  type MantineColorsTuple,
} from '@mantine/core';

/** Slate navy of the 84softworks band; index 6 is the brand value #212842. */
const brand: MantineColorsTuple = [
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

/** Warm orange accent; index 6 is the brand value #dd5410, index 5 the brighter shade used on dark. */
const accent: MantineColorsTuple = [
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
const gray: MantineColorsTuple = [
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
 * Dark scheme tinted with the brand hue rather than grey. Mantine reads it by index: 0 text, 2 dimmed,
 * 3 placeholder, 4 border, 5 hover, 6 surface, 7 body.
 */
const dark: MantineColorsTuple = [
  '#f2f3f7',
  '#d5d8e2',
  '#9ba1b5',
  '#6d7389',
  '#2a3047',
  '#1c2134',
  '#161a2a',
  '#0e111c',
  '#0a0c15',
  '#06070d',
];

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
  colors: { brand, accent, gray, dark },
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
