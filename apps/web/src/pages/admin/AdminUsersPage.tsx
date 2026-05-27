import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client/admin';
import type { AdminUserItem, PaginatedResponse, ViolationRecordItem, ViolationSummary } from '@linksee/shared';

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse<AdminUserItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  // Violation history dialog
  const [violationUserId, setViolationUserId] = useState<number | null>(null);
  const [violationSummary, setViolationSummary] = useState<ViolationSummary | null>(null);
  const [violationRecords, setViolationRecords] = useState<ViolationRecordItem[]>([]);
  const [violationLoading, setViolationLoading] = useState(false);

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

  const handleViewViolations = async (userId: number) => {
    setViolationUserId(userId);
    setViolationLoading(true);
    try {
      const res = await adminApi.getUserViolations(userId, { page: 1, size: 50 });
      setViolationSummary(res.data.data.summary);
      setViolationRecords(res.data.data.list);
    } catch {
    } finally {
      setViolationLoading(false);
    }
  };

  const handleLiftPenalty = async (userId: number) => {
    try {
      await adminApi.liftPenalty(userId);
      handleViewViolations(userId);
    } catch {}
  };

  const statusBadge = (status: number) => {
    if (status === 0) return <Badge className="bg-red-100 text-red-700">禁用</Badge>;
    if (status === 2) return <Badge className="bg-yellow-100 text-yellow-700">禁言</Badge>;
    return <Badge variant="secondary">正常</Badge>;
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      sortable: true,
    },
    {
      key: 'avatar',
      label: '头像',
      className: 'w-16',
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
      render: (status: number) => statusBadge(status),
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
      <div>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Icon icon="mdi:account-group" width={22} height={22} className="text-primary" />
          用户管理
        </h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统中的所有用户账号</p>
      </div>

      <AdminDataTable
        data={data}
        columns={columns}
        searchPlaceholder="搜索用户（昵称/邮箱）"
        onSearch={(k) => { setKeyword(k); setPage(1); }}
        onPageChange={setPage}
        currentPage={page}
        pageSize={PAGE_SIZE}
        loading={loading}
        emptyMessage="未找到匹配的用户"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewViolations(row.id)}
              title="违规记录"
            >
              <Icon icon="mdi:alert-circle" width={16} height={16} className="text-orange-600" />
            </Button>
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

      {/* Violation History Dialog */}
      <Dialog open={violationUserId !== null} onOpenChange={() => setViolationUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" width={20} height={20} className="text-orange-600" />
              违规记录
            </DialogTitle>
            <DialogDescription>用户 ID: {violationUserId}</DialogDescription>
          </DialogHeader>

          {violationLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {violationSummary && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">历史违规总数</p>
                    <p className="text-xl font-bold">{violationSummary.totalViolations}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">近30天违规</p>
                    <p className="text-xl font-bold text-orange-600">{violationSummary.recentViolations}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">当前状态</p>
                    <p className="text-sm font-semibold">{statusBadge(violationSummary.currentStatus)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">禁言至</p>
                    <p className="text-sm">
                      {violationSummary.muteUntil
                        ? new Date(violationSummary.muteUntil).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Lift penalty */}
              {violationSummary && violationSummary.currentStatus !== 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => handleLiftPenalty(violationUserId!)}
                >
                  <Icon icon="mdi:handshake" width={16} height={16} className="mr-1" />
                  解除处罚
                </Button>
              )}

              {/* Records list */}
              {violationRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">暂无违规记录</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">违规历史 ({violationRecords.length})</p>
                  {violationRecords.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                      <Badge className="shrink-0 mt-0.5" variant={
                        r.actionTaken === 'ban' ? 'destructive' :
                        r.actionTaken === 'mute' ? 'outline' : 'secondary'
                      }>
                        {r.actionTaken === 'ban' ? '封禁' : r.actionTaken === 'mute' ? '禁言' : '警告'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {r.violationType} / {r.violationCategory} &middot; 扣 {r.penaltyPoints} 分
                        </p>
                        {r.reason && <p className="mt-0.5">{r.reason}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
