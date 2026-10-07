// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';

import { useGetPlatformInfoQuery } from '@/api/platformApi';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import { brand, consoleVersion } from '@/shared/brand';

/** What this console is, which versions are running, and the legal facts: product, author, license. */
export function About() {
  const { t } = useLang();
  const { data: platformInfo } = useGetPlatformInfoQuery();

  return (
    <>
      <PageHeader page={t.pages.about} />
      <p className="tvx-lede">{t.about.intro}</p>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.about.versions}</h2>
        <FactRow label={t.about.console}>{consoleVersion}</FactRow>
        <FactRow label={t.about.server}>
          {platformInfo ? `${platformInfo.name} ${platformInfo.version}` : t.about.serverUnknown}
        </FactRow>
      </section>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.about.legal}</h2>
        <FactRow label={t.about.product}>{t.about.productValue}</FactRow>
        <FactRow label={t.about.licensor}>
          <a href={brand.authorGithub} target="_blank" rel="noreferrer">
            {t.about.authorName} ({brand.authorHandle})
          </a>
          {' · '}
          {brand.organization}
        </FactRow>
        <FactRow label={t.about.website}>
          <a href={brand.website} target="_blank" rel="noreferrer">
            {brand.websiteLabel}
          </a>
        </FactRow>
        <FactRow label={t.about.source}>
          <a href={brand.sourceRepository} target="_blank" rel="noreferrer">
            {brand.sourceRepositoryLabel}
          </a>
        </FactRow>
        <FactRow label={t.about.contact}>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </FactRow>
        <FactRow label={t.about.license}>
          <a href={brand.licenseText} target="_blank" rel="noreferrer">
            {t.about.licenseValue}
          </a>
        </FactRow>
        <p className="tvx-body" style={{ marginTop: 24 }}>
          {t.about.licenseTerms}
        </p>
        <p className="tvx-body" style={{ marginTop: 16 }}>
          {t.about.thirdParty}
        </p>
        <p className="tvx-body tvx-muted" style={{ marginTop: 16 }}>
          {t.about.copyright}
        </p>
      </section>
    </>
  );
}

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tvx-row">
      <span className="tvx-row__lbl">{label}</span>
      <span className="tvx-row__val">{children}</span>
    </div>
  );
}
