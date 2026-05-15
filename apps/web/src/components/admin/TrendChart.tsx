import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { TrendItem } from '@linksee/shared';

interface TrendChartProps {
  title: string;
  data: TrendItem[];
  color?: string;
  height?: number;
}

export function TrendChart({ title, data, color = '#6366f1', height = 200 }: TrendChartProps) {
  const chartConfig: ChartConfig = useMemo(
    () => ({
      count: {
        label: title,
        color,
      },
    }),
    [title, color],
  );

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        date: item.date.slice(5),
        fullDate: item.date,
        count: item.count,
      })),
    [data],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickMargin={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickMargin={4}
                allowDecimals={false}
                width={32}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="fullDate"
                    indicator="line"
                  />
                }
              />
              <Area
                dataKey="count"
                type="monotone"
                stroke={color}
                strokeWidth={2}
                fill={`url(#fill-${title})`}
                dot={{ r: 3, fill: 'white', strokeWidth: 2 }}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height }}
          >
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  );
}
