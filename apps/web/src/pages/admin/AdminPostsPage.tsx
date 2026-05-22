import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client/admin';
import type { AdminPostItem, PaginatedResponse } from '@linksee/shared';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<number, { label: string; className: string }> = {
  0: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
  1: { label: '已发布', className: 'bg-green-100 text-green-700' },
  2: { label: '审核中', className: 'bg-yellow-100 text-yellow-700' },
  3: { label: '违规', className: 'bg-red-100 text-red-700' },
  4: { label: '定时发布', className: 'bg-blue-100 text-blue-700' },
};

export function AdminPostsPage() {
  const [data, setData] = useState<PaginatedResponse<AdminPostItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, size: PAGE_SIZE, keyword };
      if (statusFilter !== 'all') {
        params.status = Number(statusFilter);
      }
      const res = await adminApi.listPosts(params);
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModerate = async (postId: number, action: string) => {
    try {
      await adminApi.moderatePost(postId, { action });
      toast.success(action === 'approve' ? '已通过' : '已拒绝');
      fetchData();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleSetFeature = async (postId: number, isTop?: boolean, isEssence?: boolean) => {
    try {
      await adminApi.setPostFeature(postId, { isTop, isEssence });
      fetchData();
    } catch {}
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      sortable: true,
    },
    {
      key: 'title',
      label: '标题',
      render: (title: string, row: AdminPostItem) => (
        <div>
          <p className="text-sm font-medium text-foreground truncate max-w-xs">{title}</p>
          <p className="text-xs text-muted-foreground">{row.authorNickname}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: '审核状态',
      render: (status: number) => {
        const cfg = STATUS_LABELS[status] || { label: '未知', className: 'bg-gray-100 text-gray-700' };
        return (
          <Badge variant="outline" className={`text-[11px] ${cfg.className}`}>
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      key: 'flags',
      label: '标记',
      render: (_: unknown, row: AdminPostItem) => (
        <div className="flex flex-wrap gap-1">
          {row.isTop && (
            <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 text-[10px]">
              <Icon icon="mdi:pin" width={10} height={10} className="mr-0.5" />
              置顶
            </Badge>
          )}
          {row.isEssence && (
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px]">
              <Icon icon="mdi:star" width={10} height={10} className="mr-0.5" />
              精华
            </Badge>
          )}
          {!row.isTop && !row.isEssence && <span className="text-xs text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      key: 'viewCount',
      label: '浏览',
      className: 'w-16',
    },
    {
      key: 'publishedAt',
      label: '发布时间',
      render: (date: string | null) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Icon icon="mdi:post" width={22} height={22} className="text-primary" />
            帖子管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">审核和管理社区帖子</p>
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="2">审核中</SelectItem>
            <SelectItem value="1">已发布</SelectItem>
            <SelectItem value="3">违规</SelectItem>
            <SelectItem value="0">草稿</SelectItem>
            <SelectItem value="4">定时发布</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminDataTable
        data={data}
        columns={columns}
        searchPlaceholder="搜索帖子标题"
        onSearch={(k) => { setKeyword(k); setPage(1); }}
        onPageChange={setPage}
        currentPage={page}
        pageSize={PAGE_SIZE}
        loading={loading}
        emptyMessage="未找到匹配的帖子"
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === 2 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleModerate(row.id, 'approve')}
                  title="通过审核"
                >
                  <Icon icon="mdi:check-circle" width={17} height={17} className="text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleModerate(row.id, 'reject')}
                  title="标记违规"
                >
                  <Icon icon="mdi:close-circle" width={17} height={17} className="text-red-600" />
                </Button>
              </>
            )}
            {row.status === 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleModerate(row.id, 'violate')}
                title="设为违规"
              >
                <Icon icon="mdi:alert-circle" width={17} height={17} className="text-amber-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSetFeature(row.id, !row.isTop)}
              title={row.isTop ? '取消置顶' : '置顶'}
            >
              <Icon
                icon="mdi:pin"
                width={16}
                height={16}
                className={row.isTop ? 'text-rose-600' : ''}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSetFeature(row.id, undefined, !row.isEssence)}
              title={row.isEssence ? '取消精华' : '设为精华'}
            >
              <Icon
                icon="mdi:star"
                width={16}
                height={16}
                className={row.isEssence ? 'text-amber-600' : ''}
              />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
