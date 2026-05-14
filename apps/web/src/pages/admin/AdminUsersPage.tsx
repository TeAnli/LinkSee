import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client/admin';
import type { AdminUserItem, PaginatedResponse } from '@linksee/shared';

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse<AdminUserItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.listUsers({ page, size: PAGE_SIZE, keyword });
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

  const handleUpdateStatus = async (userId: number, status: number) => {
    try {
      await adminApi.updateUserStatus(userId, { status });
      const res = await adminApi.listUsers({ page, size: PAGE_SIZE, keyword });
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
      key: 'avatar',
      label: '头像',
      render: (_: string, row: AdminUserItem) => (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {row.nickname.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'nickname',
      label: '昵称',
    },
    {
      key: 'email',
      label: '邮箱',
    },
    {
      key: 'status',
      label: '状态',
      render: (status: number) => (
        <Badge variant={status === 1 ? 'secondary' : 'outline'} className={status !== 1 ? 'bg-red-100 text-red-700' : ''}>
          {status === 1 ? '正常' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'level',
      label: '等级',
    },
    {
      key: 'createdAt',
      label: '注册时间',
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
          searchPlaceholder="搜索用户（昵称/邮箱）"
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
                onClick={() => handleUpdateStatus(row.id, row.status === 1 ? 0 : 1)}
                title={row.status === 1 ? '禁用' : '启用'}
              >
                <Icon
                  icon={row.status === 1 ? 'mdi:block-helper' : 'mdi:check'}
                  width={16}
                  height={16}
                  className={row.status === 1 ? 'text-orange-600' : 'text-green-600'}
                />
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}
