// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

interface ImportMetaEnv {
  /** Set by the image build from the git tag; "dev" when running from sources. */
  readonly VITE_APP_VERSION?: string;
}
