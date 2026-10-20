// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Code, Modal, Stack, Text } from '@mantine/core';
import { Link } from 'react-router';

import type { AuditEntry } from '@/api/types';
import { CardField, CardFields } from '@/components/EntityCard/CardFields';
import { useLang } from '@/i18n/LangContext';
import { auditActionLabel, auditDetailsEntries } from '@/pages/Audit/auditEntryText';
import { mayManageConsoleUsers } from '@/shared/consoleRoles';
import { consoleUserPath, sipAccountPath } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { useAppSelector } from '@/store/store';
import { useIsPhone } from '@/shared/useIsPhone';

/**
 * The card of one journal entry: who, when, what and to which record, every detail as a field. A journal entry is
 * never changed, so the card has no actions; the record it touched opens from here when the operator may see it.
 */
export function AuditEntryCardModal({ entry, onClose }: { entry: AuditEntry | null; onClose: () => void }) {
  const { t } = useLang();
  const isPhone = useIsPhone();

  return (
    <Modal
      opened={entry !== null}
      onClose={onClose}
      title={entry ? auditActionLabel(entry, t) : ''}
      size="lg"
      fullScreen={isPhone}
    >
      {entry && <AuditEntryCard entry={entry} />}
    </Modal>
  );
}

function AuditEntryCard({ entry }: { entry: AuditEntry }) {
  const { t } = useLang();
  const copy = t.auditCard;
  const details = auditDetailsEntries(entry);

  return (
    <Stack gap="lg">
      <CardFields>
        <CardField label={t.audit.columns.time}>{formatServerTime(entry.created_at)}</CardField>
        <CardField label={t.audit.columns.who}>
          <div>{entry.actor_login}</div>
          <div className="tvx-field__note">{copy.actorTypes[entry.actor_type] ?? entry.actor_type}</div>
        </CardField>
        <CardField label={t.audit.columns.action}>
          <div>{auditActionLabel(entry, t)}</div>
          <Code fz="xs">{entry.action}</Code>
        </CardField>
        <CardField label={copy.target}>
          <AuditTarget entry={entry} />
        </CardField>
      </CardFields>

      <div>
        <div className="tvx-field__lbl">{t.audit.columns.details}</div>
        {details.length === 0 ? (
          <Text size="sm">{t.common.none}</Text>
        ) : (
          details.map(([key, value]) => (
            <div key={key} className="tvx-row">
              <Code fz="xs" className="tvx-row__lbl">
                {key}
              </Code>
              <span className="tvx-row__val">{value}</span>
            </div>
          ))
        )}
      </div>
    </Stack>
  );
}

/** The record the action touched; a link to its card where it has one and the operator may open it. */
function AuditTarget({ entry }: { entry: AuditEntry }) {
  const { t } = useLang();
  const role = useAppSelector((state) => state.auth.user?.role);
  const typeLabel = t.auditCard.targetTypes[entry.target_type] ?? entry.target_type;

  if (entry.target_id === null) {
    return typeLabel;
  }
  const label = `${typeLabel} · id ${entry.target_id}`;
  const href =
    entry.target_type === 'SIP_ACCOUNT'
      ? sipAccountPath(entry.target_id)
      : entry.target_type === 'CONSOLE_USER' && role && mayManageConsoleUsers(role)
        ? consoleUserPath(entry.target_id)
        : null;

  return href ? (
    <Link to={href} className="tvx-link">
      {label}
    </Link>
  ) : (
    label
  );
}
