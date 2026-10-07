// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

/** Language-invariant facts about who makes the product; the copy around them lives in i18n/dict.ts. */
export const brand = {
  product: 'ThunderVox',
  organization: '84softworks',
  website: 'https://84softworks.com',
  websiteLabel: '84softworks.com',
  email: '84softworks@gmail.com',
  author: 'Andrei Baranov',
  authorHandle: 'beiroun',
  authorGithub: 'https://github.com/beiroun',
  sourceRepository: 'https://github.com/beiroun/thundervox',
  sourceRepositoryLabel: 'github.com/beiroun/thundervox',
  licenseText: 'https://github.com/beiroun/thundervox-web/blob/release/LICENSE',
} as const;

/** Set by the image build from the git tag; an image built without it, or a dev server, reads "dev". */
export const consoleVersion = import.meta.env.VITE_APP_VERSION || 'dev';
