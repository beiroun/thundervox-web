// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Loader, SegmentedControl, Text } from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';

import { describeApiError } from '@/api/baseQuery';
import { useGetDashboardQuery } from '@/api/dashboardApi';
import type { Dashboard as DashboardData, DashboardRange } from '@/api/types';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import type { Copy } from '@/i18n/dict';

const ranges: DashboardRange[] = ['1h', '6h', '1d', '1w', '1m'];

/** The journals move by the half-minute (presence samples), so the page re-reads at the same pace. */
const refreshMs = 30_000;

/** Time axis label of a bucket: time of day within a day, day and time for the longer ranges. */
function bucketLabel(at: string, range: DashboardRange): string {
  const time = at.slice(11, 16);
  return range === '1w' || range === '1m' ? `${at.slice(8, 10)}.${at.slice(5, 7)} ${time}` : time;
}

function counters(data: DashboardData, labels: Copy['dashboard']['counters']) {
  return [
    { label: labels.online, value: data.counters.online },
    { label: labels.offline, value: data.counters.offline },
    { label: labels.subscribers, value: data.counters.subscribers },
    { label: labels.pushes, value: data.counters.pushes },
    { label: labels.registrations, value: data.counters.registrations },
    { label: labels.calls, value: data.counters.calls },
  ];
}

/**
 * Landing page: presence right now and activity over a selectable period, as a metric strip and two charts. The
 * server's identity moved to About and the footer - this page is about the numbers, not about the server.
 */
export function Dashboard() {
  const { t } = useLang();
  const [range, setRange] = useState<DashboardRange>('1h');
  const { data, error, isLoading } = useGetDashboardQuery(range, { pollingInterval: refreshMs });

  const points = (data?.points ?? []).map((point) => ({ ...point, label: bucketLabel(point.at, range) }));
  const presenceSeries = [
    { name: 'online', label: t.dashboard.counters.online, color: 'accent.6' },
    { name: 'offline', label: t.dashboard.counters.offline, color: 'gray.5' },
    { name: 'subscribers', label: t.dashboard.counters.subscribers, color: 'brand.6' },
  ];
  const activitySeries = [
    { name: 'calls', label: t.dashboard.counters.calls, color: 'accent.6' },
    { name: 'pushes', label: t.dashboard.counters.pushes, color: 'brand.6' },
    { name: 'registrations', label: t.dashboard.counters.registrations, color: 'teal.6' },
  ];
  // ~180 buckets on the month view: let recharts thin the labels out instead of stacking them
  const xAxisProps = { interval: 'preserveStartEnd' as const, minTickGap: 32 };

  return (
    <>
      <PageHeader
        page={t.pages.dashboard}
        actions={
          <SegmentedControl
            value={range}
            onChange={(value) => setRange(value as DashboardRange)}
            data={ranges.map((candidate) => ({ value: candidate, label: t.dashboard.ranges[candidate] }))}
          />
        }
      />

      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
      {isLoading && !data && <Loader size="sm" />}

      <div className="tvx-metrics">
        {(data ? counters(data, t.dashboard.counters) : []).map((counter) => (
          <div className="tvx-metric" key={counter.label}>
            <div className="tvx-metric__num">{counter.value}</div>
            <div className="tvx-metric__lbl">{counter.label}</div>
          </div>
        ))}
      </div>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.dashboard.presence}</h2>
        <Text c="dimmed" size="sm" mb="md">
          {t.dashboard.presenceLede}
        </Text>
        <AreaChart
          h={260}
          data={points}
          dataKey="label"
          series={presenceSeries}
          curveType="monotone"
          withDots={false}
          connectNulls={false}
          withLegend
          legendProps={{ verticalAlign: 'bottom' }}
          tickLine="none"
          gridAxis="y"
          fillOpacity={0.12}
          strokeWidth={1.5}
          xAxisProps={xAxisProps}
        />
      </section>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.dashboard.activity}</h2>
        <Text c="dimmed" size="sm" mb="md">
          {t.dashboard.activityLede}
        </Text>
        <BarChart
          h={260}
          data={points}
          dataKey="label"
          series={activitySeries}
          withLegend
          legendProps={{ verticalAlign: 'bottom' }}
          tickLine="none"
          gridAxis="y"
          xAxisProps={xAxisProps}
        />
      </section>
    </>
  );
}
