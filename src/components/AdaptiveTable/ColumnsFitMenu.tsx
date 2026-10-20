// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { ActionIcon, Menu, Stack, Text } from '@mantine/core';
import { IconArrowBackUp, IconLayoutColumns } from '@tabler/icons-react';

import { useLang } from '@/i18n/LangContext';

interface ColumnsFitMenuProps {
  hiddenTitles: { key: string; title: string }[];
  hasOperatorWidths: boolean;
  onResetWidths: () => void;
}

/**
 * The corner of the last heading, shown only when it has something to say: which columns did not fit, and
 * "reset widths" once the operator has dragged any column.
 */
export function ColumnsFitMenu({ hiddenTitles, hasOperatorWidths, onResetWidths }: ColumnsFitMenuProps) {
  const { t } = useLang();
  const hint = hiddenTitles.length > 0 ? t.table.columnsHidden(hiddenTitles.length) : t.table.columnWidths;

  return (
    <Menu position="bottom-end" withinPortal width={280}>
      <Menu.Target>
        <ActionIcon
          size="md"
          variant="subtle"
          color={hiddenTitles.length > 0 ? 'accent' : 'gray'}
          aria-label={hint}
          title={hint}
          className="tvx-table__columns-control"
        >
          <IconLayoutColumns size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {hiddenTitles.length > 0 && (
          <>
            <Menu.Label>{t.table.notFitted}</Menu.Label>
            <Stack gap={2} px="sm" pb="xs">
              {hiddenTitles.map(({ key, title }) => (
                <Text key={key} size="sm">
                  {title}
                </Text>
              ))}
              <Text size="xs" c="dimmed" mt={4}>
                {t.table.notFittedHint}
              </Text>
            </Stack>
            <Menu.Divider />
          </>
        )}
        <Menu.Item leftSection={<IconArrowBackUp size={14} />} disabled={!hasOperatorWidths} onClick={onResetWidths}>
          {t.table.resetWidths}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
