import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client/admin';
import type { PaginatedResponse } from '@linksee/shared';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface AdminCommentItem {
  id: number;
  content: string;
  postId: number;
  postTitle: string;
  userId: number;
  authorNickname: string;
  createdAt: string;
}

export function AdminCommentsPage() {
  const [data, setData] = useState<PaginatedResponse<AdminCommentItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listComments({ page, size: PAGE_SIZE, keyword: keyword || undefined });
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (row: AdminCommentItem) => {
    if (!window.confirm('确定要删除该评论吗？')) return;
    try {
      await adminApi.deleteComment(row.id);
      toast.success('评论已删除');
      fetchData();
    } catch {
      toast.error('删除失败');
    }
  };

  const columns = [
    {
      key: 'content',
      label: '评论内容',
      render: (_: unknown, row: AdminCommentItem) => (
        <span className="text-sm line-clamp-2 max-w-[320px]">{row.content}</span>
      ),
    },
    {
      key: 'authorNickname',
      label: '作者',
      render: (_: unknown, row: AdminCommentItem) => (
        <span className="text-sm font-medium">{row.authorNickname}</span>
      ),
    },
    {
      key: 'postTitle',
      label: '所属帖子',
      render: (_: unknown, row: AdminCommentItem) => (
        <a
          href={`/post/${row.postId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline line-clamp-1 max-w-[200px]"
        >
          {row.postTitle}
        </a>
      ),
    },
    {
      key: 'createdAt',
      label: '发布时间',
      render: (_: unknown, row: AdminCommentItem) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Icon icon="mdi:comment-text-multiple" width={22} className="text-primary" />
          评论管理
        </h1>
        <p className="text-sm text-muted-foreground mt-1">查看和管理所有用户评论</p>
      </div>

      <AdminDataTable
        data={data}
        columns={columns}
        loading={loading}
        currentPage={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={(kw) => { setKeyword(kw); setPage(1); }}
        searchPlaceholder="搜索评论内容..."
        actions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Icon icon="mdi:delete-outline" width={16} className="mr-1" />
            删除
          </Button>
        )}
      />
    </div>
  );
}
