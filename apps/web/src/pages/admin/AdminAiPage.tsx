import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/admin/StatCard';
import { adminApi } from '@linksee/api-client/admin';
import type { AiUsageStats, AiTaskLogItem } from '@linksee/shared';

export function AdminAiPage() {
  const [stats, setStats] = useState<AiUsageStats | null>(null);
  const [tasks, setTasks] = useState<AiTaskLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, tasksRes] = await Promise.all([
          adminApi.aiUsageStats(),
          adminApi.aiTaskLogs({ page: 1, size: 20 }),
        ]);
        if (cancelled) return;
        setStats(statsRes.data.data);
        setTasks(tasksRes.data.data.tasks || []);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="size-12 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Icon icon="mdi:brain" width={22} height={22} className="text-primary" />
          AI 用量
        </h1>
        <p className="text-sm text-muted-foreground mt-1">监控 AI 模型调用和资源消耗</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="mdi:api"
          label="总调用次数"
          value={stats?.totalCalls?.toLocaleString() || '0'}
          iconBgColor="#8b5cf6"
        />
        <StatCard
          icon="mdi:arrow-down-circle"
          label="输入 Token"
          value={stats?.totalTokensInput?.toLocaleString() || '0'}
          iconBgColor="#06b6d4"
        />
        <StatCard
          icon="mdi:arrow-up-circle"
          label="输出 Token"
          value={stats?.totalTokensOutput?.toLocaleString() || '0'}
          iconBgColor="#10b981"
        />
        <StatCard
          icon="mdi:cash-multiple"
          label="估算费用"
          value={`¥${(stats?.costEstimate || 0).toFixed(4)}`}
          iconBgColor="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="mdi:chart-pie" width={16} height={16} className="text-indigo-600" />
              使用分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.breakdown?.length ? (
              <div className="space-y-3">
                {stats.breakdown.map((item) => {
                  const pct = Math.min((item.calls / (stats?.totalCalls || 1)) * 100, 100);
                  return (
                    <div key={item.groupBy} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.groupBy}</span>
                        <span className="font-medium tabular-nums">
                          {item.calls.toLocaleString()} 次
                          <span className="text-muted-foreground ml-1">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                <Icon icon="mdi:chart-pie-outline" width={28} height={28} />
                暂无使用数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="mdi:history" width={16} height={16} />
              最近任务
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2.5 border-b last:border-0 border-border/50"
                >
                  <div className="flex items-center gap-2.5 size-9 rounded-lg bg-muted shrink-0">
                    <Icon icon="mdi:cog" width={18} className="mx-auto text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.taskType}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {task.modelUsed}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.tokensInput + task.tokensOutput} tokens
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                <Icon icon="mdi:history" width={28} height={28} />
                暂无任务记录
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
