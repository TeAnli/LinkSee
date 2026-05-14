import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex items-center justify-center h-64">
        <Icon icon="mdi:loading" width={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="mdi:brain"
          label="总调用"
          value={stats?.totalCalls || 0}
          iconBgColor="#8b5cf6"
        />
        <StatCard
          icon="mdi:counter"
          label="输入 Token"
          value={stats?.totalTokensInput || 0}
          iconBgColor="#06b6d4"
        />
        <StatCard
          icon="mdi:counter"
          label="输出 Token"
          value={stats?.totalTokensOutput || 0}
          iconBgColor="#10b981"
        />
        <StatCard
          icon="mdi:cash"
          label="估算费用"
          value={`¥${(stats?.costEstimate || 0).toFixed(4)}`}
          iconBgColor="#f59e0b"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon icon="mdi:chart-pie" width={16} height={16} className="text-indigo-600" />
            使用分布
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {stats?.breakdown?.map((item) => (
              <div key={item.groupBy} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.groupBy}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${Math.min((item.calls / (stats?.totalCalls || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-foreground w-16 text-right">{item.calls} 次</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon icon="mdi:history" width={16} height={16} className="text-foreground" />
            最近任务
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length ? (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.taskType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.modelUsed} · {task.tokensInput + task.tokensOutput} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              暂无任务记录
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
