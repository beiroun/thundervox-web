// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

/**
 * The ThunderVox mark - the same geometry as the favicon set: a navy disc inside the orange ring, the bolt in
 * orange. Fixed brand colours in both schemes, like the icon on the tab.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="16" fill="#dd5410" />
      <circle cx="16" cy="16" r="13.6" fill="#212842" />
      <path d="M17.44 7.36 10.24 17.44h5.04l-0.72 7.2 7.2-10.08h-5.04z" fill="#dd5410" />
    </svg>
  );
}
