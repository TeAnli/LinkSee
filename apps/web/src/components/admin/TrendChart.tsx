import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrendItem } from '@linksee/shared';

interface TrendChartProps {
  title: string;
  data: TrendItem[];
  color?: string;
  height?: number;
}

export function TrendChart({ title, data, color = '#6366f1', height = 180 }: TrendChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return { points: [], max: 0 };
    
    const max = Math.max(...data.map((d) => d.count), 1);
    const width = 100;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((item, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - (item.count / max) * chartHeight,
      value: item.count,
      label: item.date,
    }));
    
    return { points, max };
  }, [data, height]);

  const pathD = useMemo(() => {
    if (chartData.points.length < 2) return '';
    return chartData.points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  }, [chartData.points]);

  const areaD = useMemo(() => {
    if (chartData.points.length < 2) return '';
    const padding = 20;
    const chartHeight = height - padding * 2;
    const firstPoint = chartData.points[0]!;
    const lastPoint = chartData.points[chartData.points.length - 1]!;
    
    return `${pathD} L ${lastPoint.x} ${padding + chartHeight} L ${firstPoint.x} ${padding + chartHeight} Z`;
  }, [pathD, chartData.points, height]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 100 ${height}`}
          className="w-full"
          style={{ height: `${height}px` }}
          preserveAspectRatio="none"
        >
          {chartData.max > 0 && (
            <>
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <path
                d={areaD}
                fill="url(#chartGradient)"
              />
              
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {chartData.points.map((point, i) => (
                <g key={i}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill="white"
                    stroke={color}
                    strokeWidth="2"
                  />
                  <text
                    x={point.x}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: '4px' }}
                  >
                    {point.label.slice(5)}
                  </text>
                </g>
              ))}
            </>
          )}
          
          {chartData.points.length === 0 && (
            <text
              x="50"
              y={height / 2}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: '5px' }}
            >
              No data
            </text>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
