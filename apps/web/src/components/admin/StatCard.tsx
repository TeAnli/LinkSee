import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  iconBgColor?: string;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  iconBgColor = 'var(--primary)',
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn('p-4', className)}>
      <CardContent className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              <Badge
                variant={isPositive ? 'secondary' : 'outline'}
                className={cn(
                  'text-xs font-medium',
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                )}
              >
                <Icon
                  icon={isPositive ? 'mdi:trending-up' : 'mdi:trending-down'}
                  width={12}
                  height={12}
                  className="mr-1"
                />
                {isPositive ? '+' : ''}{change}%
                {changeLabel && <span className="ml-1 text-muted-foreground">{changeLabel}</span>}
              </Badge>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-center size-12 rounded-xl shadow-flat"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon icon={icon} width={24} height={24} color="#fff" />
        </div>
      </CardContent>
    </Card>
  );
}
