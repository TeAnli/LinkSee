import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/StatCard';
import { TrendChart } from '@/components/admin/TrendChart';
import { adminApi } from '@linksee/api-client/admin';
import type { DashboardData } from '@linksee/shared';

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await adminApi.dashboard();
        if (cancelled) return;
        setData(res.data.data);
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
          icon="mdi:account-group"
          label="总用户"
          value={data?.overview.totalUsers || 0}
          iconBgColor="#6366f1"
        />
        <StatCard
          icon="mdi:post"
          label="总帖子"
          value={data?.overview.totalPosts || 0}
          iconBgColor="#10b981"
        />
        <StatCard
          icon="mdi:chat"
          label="总评论"
          value={data?.overview.totalComments || 0}
          iconBgColor="#f59e0b"
        />
        <StatCard
          icon="mdi:brain"
          label="今日 AI 调用"
          value={data?.overview.aiCallsToday || 0}
          iconBgColor="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart title="帖子趋势" data={data?.trendPosts || []} color="#6366f1" />
        <TrendChart title="用户趋势" data={data?.trendUsers || []} color="#10b981" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon icon="mdi:fire" width={16} height={16} className="text-orange-600" />
            热门帖子
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.hotPosts?.length ? (
            data.hotPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.authorNickname} · {post.viewCount} 浏览
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Icon icon="mdi:chevron-right" width={16} height={16} />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              暂无热门帖子
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
