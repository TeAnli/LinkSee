import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client/admin';
import type { AdminPostItem, PaginatedResponse } from '@linksee/shared';

const PAGE_SIZE = 20;

export function AdminPostsPage() {
  const [data, setData] = useState<PaginatedResponse<AdminPostItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.listPosts({ page, size: PAGE_SIZE, keyword });
        if (cancelled) return;
        setData(res.data.data);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [page, keyword]);

  const handleSetFeature = async (postId: number, isTop?: boolean, isEssence?: boolean) => {
    try {
      await adminApi.setPostFeature(postId, { isTop, isEssence });
      const res = await adminApi.listPosts({ page, size: PAGE_SIZE, keyword });
      setData(res.data.data);
    } catch {}
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
    },
    {
      key: 'title',
      label: '标题',
      render: (title: string, row: AdminPostItem) => (
        <div>
          <p className="text-sm font-medium text-foreground truncate max-w-xs">{title}</p>
          <p className="text-xs text-muted-foreground">
            {row.authorNickname}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: '状态',
      render: (_: number, row: AdminPostItem) => (
        <div className="flex flex-wrap gap-1">
          {row.isTop && <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 text-[10px]">置顶</Badge>}
          {row.isEssence && <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px]">精华</Badge>}
        </div>
      ),
    },
    {
      key: 'viewCount',
      label: '浏览',
    },
    {
      key: 'publishedAt',
      label: '发布时间',
      render: (date: string | null) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
  ];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Icon icon="mdi:loading" width={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminDataTable
          data={data}
          columns={columns}
          searchPlaceholder="搜索帖子"
          onSearch={(k) => { setKeyword(k); setPage(1); }}
          onPageChange={setPage}
          currentPage={page}
          pageSize={PAGE_SIZE}
          actions={(row) => (
            <div className="flex items-center gap-1">
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
      )}
    </div>
  );
}
