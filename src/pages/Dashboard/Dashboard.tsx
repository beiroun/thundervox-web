// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Loader, SegmentedControl, Text } from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import type { AreaChartSeries } from '@mantine/charts';

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

/**
 * The fleet right now (subscribers + panels = total = online + offline), then the activity over the period. On a
 * wide screen the strip is five columns, so the fleet fills the first row and the activity starts the second.
 */
function counters(data: DashboardData, labels: Copy['dashboard']['counters']) {
  return [
    { label: labels.subscribers, value: data.counters.subscribers },
    { label: labels.panels, value: data.counters.panels },
    { label: labels.total, value: data.counters.total },
    { label: labels.online, value: data.counters.online },
    { label: labels.offline, value: data.counters.offline },
    { label: labels.pushes, value: data.counters.pushes },
    { label: labels.registrations, value: data.counters.registrations },
    { label: labels.calls, value: data.counters.calls },
  ];
}

/** Recharts sorts legend items by name unless told otherwise; the parts must come before the total. */
function legendInSeriesOrder(series: { name: string }[]) {
  const order = series.map((item) => item.name);
  return { verticalAlign: 'bottom' as const, itemSorter: (item: { dataKey?: unknown }) => order.indexOf(String(item.dataKey)) };
}

/** Headroom above the ceiling, so the dashed total reads as a line and not as the frame of the plot. */
const countAxis = { allowDecimals: false, domain: [0, (dataMax: number) => Math.max(1, Math.ceil(dataMax * 1.1))] as const };

/**
 * The total is the same line on both fleet charts - the envelope the parts add up to - so it is drawn the same way
 * on both: a dashed ink line without a fill, a reference rather than a category, while the parts keep their washes.
 * Ink instead of the brand hue: on the navy canvas the brand periwinkle is indistinguishable from any blue or
 * purple part for deutan readers (palette checks), and no hue was left for the panels.
 */
const totalSeries = (label: string): AreaChartSeries => ({
  name: 'total',
  label,
  color: 'var(--tvx-ink-soft)',
  strokeDasharray: '6 4',
});
const withoutFillOnTotal = (series: AreaChartSeries) => (series.name === 'total' ? { fillOpacity: 0 } : {});

/**
 * Landing page: the fleet and presence over a selectable period as two charts that share the total as their
 * ceiling, activity per bucket below, and the numbers right now as a metric strip on top. The server's identity
 * moved to About and the footer - this page is about the numbers, not about the server.
 */
export function Dashboard() {
  const { t } = useLang();
  const [range, setRange] = useState<DashboardRange>('1h');
  const { data, error, isLoading } = useGetDashboardQuery(range, { pollingInterval: refreshMs });

  const points = (data?.points ?? []).map((point) => ({ ...point, label: bucketLabel(point.at, range) }));
  // Hues validated as pairs (dataviz palette checks, both schemes): accent / grape for the kinds, teal / gray for
  // the presence; the dashed total is a reference line, not a category
  const fleetSeries: AreaChartSeries[] = [
    { name: 'subscribers', label: t.dashboard.counters.subscribers, color: 'accent.6' },
    { name: 'panels', label: t.dashboard.counters.panels, color: 'grape.6' },
    totalSeries(t.dashboard.counters.total),
  ];
  const presenceSeries: AreaChartSeries[] = [
    { name: 'online', label: t.dashboard.counters.online, color: 'teal.7' },
    { name: 'offline', label: t.dashboard.counters.offline, color: 'gray.6' },
    totalSeries(t.dashboard.counters.total),
  ];
  const activitySeries = [
    { name: 'calls', label: t.dashboard.counters.calls, color: 'accent.6' },
    { name: 'pushes', label: t.dashboard.counters.pushes, color: 'brand.6' },
    { name: 'registrations', label: t.dashboard.counters.registrations, color: 'teal.6' },
  ];
  // ~120 buckets on the month view: let recharts thin the labels out instead of stacking them
  const xAxisProps = { interval: 'preserveStartEnd' as const, minTickGap: 32 };
  const fleetChartProps = {
    h: 260,
    data: points,
    dataKey: 'label',
    curveType: 'monotone' as const,
    withDots: false,
    connectNulls: false,
    withLegend: true,
    tickLine: 'none' as const,
    gridAxis: 'y' as const,
    fillOpacity: 0.12,
    strokeWidth: 1.5,
    xAxisProps,
    yAxisProps: countAxis,
    areaProps: withoutFillOnTotal,
  };

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
        <h2 className="tvx-section__title">{t.dashboard.fleet}</h2>
        <Text c="dimmed" size="sm" mb="md">
          {t.dashboard.fleetLede}
        </Text>
        <AreaChart {...fleetChartProps} series={fleetSeries} legendProps={legendInSeriesOrder(fleetSeries)} />
      </section>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{t.dashboard.presence}</h2>
        <Text c="dimmed" size="sm" mb="md">
          {t.dashboard.presenceLede}
        </Text>
        <AreaChart {...fleetChartProps} series={presenceSeries} legendProps={legendInSeriesOrder(presenceSeries)} />
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
          legendProps={legendInSeriesOrder(activitySeries)}
          tickLine="none"
          gridAxis="y"
          xAxisProps={xAxisProps}
        />
      </section>
    </>
  );
}
