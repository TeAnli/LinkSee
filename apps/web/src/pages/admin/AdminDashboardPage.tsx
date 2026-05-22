import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[180px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[180px] w-full" />
            </CardContent>
          </Card>
        </div>
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
          icon="mdi:shield-alert"
          label="待审核"
          value={data?.overview.pendingReviewPosts || 0}
          iconBgColor="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="mdi:account-check"
          label="7日活跃用户"
          value={data?.overview.activeUsers7d || 0}
          iconBgColor="#8b5cf6"
        />
        <StatCard
          icon="mdi:robot"
          label="今日 AI 调用"
          value={data?.overview.aiCallsToday || 0}
          iconBgColor="#06b6d4"
        />
        <StatCard
          icon="mdi:calendar-plus"
          label="今日新用户"
          value={data?.overview.newUsersToday || 0}
          iconBgColor="#84cc16"
        />
        <StatCard
          icon="mdi:file-plus"
          label="今日新帖"
          value={data?.overview.newPostsToday || 0}
          iconBgColor="#f97316"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart title="帖子趋势" data={data?.trendPosts || []} color="#6366f1" />
        <TrendChart title="用户趋势" data={data?.trendUsers || []} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                <Icon icon="mdi:fire-off" width={28} height={28} />
                暂无热门帖子
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="mdi:history" width={16} height={16} className="text-blue-600" />
              最近审核记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentModerations?.length ? (
              data.recentModerations.map((mod) => (
                <div key={mod.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {mod.postTitle || `帖子 #${mod.postId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mod.action === 'pass' ? '已通过' : mod.action === 'reject' ? '已拒绝' : '待审核'}
                      {mod.reason && ` · ${mod.reason}`}
                      {mod.createdAt && ` · ${new Date(mod.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                <Icon icon="mdi:clipboard-text-off" width={28} height={28} />
                暂无审核记录
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
