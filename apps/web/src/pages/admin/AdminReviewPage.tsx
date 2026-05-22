import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Pagination } from '@/components/ui/pagination';
import { adminApi } from '@linksee/api-client';
import type { AdminPostItem, PaginatedResponse } from '@linksee/shared';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface ReviewingPost extends AdminPostItem {
  content?: string;
  categoryId?: number;
  moderationLog?: {
    confidence: number | null;
    violationType: string;
    action: string;
  } | null;
  createdAt?: string;
}

export function AdminReviewPage() {
  const [data, setData] = useState<PaginatedResponse<ReviewingPost>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Moderation dialog
  const [moderateTarget, setModerateTarget] = useState<{ postId: number; action: string } | null>(null);
  const [moderateReason, setModerateReason] = useState('');
  const [moderating, setModerating] = useState(false);

  // Logs dialog
  const [logsPostId, setLogsPostId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Array<{
    id: number;
    result: number;
    violationType: string;
    confidence: number;
    action: string;
    createdAt: string;
  }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listReviewingPosts({ page, size: PAGE_SIZE });
      setData(res.data.data as PaginatedResponse<ReviewingPost>);
    } catch {
      toast.error('加载待审核帖子失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModerateConfirm = async () => {
    if (!moderateTarget) return;
    setModerating(true);
    try {
      await adminApi.moderatePost(moderateTarget.postId, {
        action: moderateTarget.action,
        reason: moderateReason || undefined,
      });
      toast.success(moderateTarget.action === 'approve' ? '已通过审核' : '已标记违规');
      setModerateTarget(null);
      setModerateReason('');
      fetchData();
    } catch {
      toast.error('操作失败');
    } finally {
      setModerating(false);
    }
  };

  const handleViewLogs = async (postId: number) => {
    setLogsPostId(postId);
    setLogsLoading(true);
    try {
      const res = await adminApi.getModerationLogs(postId);
      setLogs(res.data.data);
    } catch {
      toast.error('加载审核日志失败');
    } finally {
      setLogsLoading(false);
    }
  };

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  const confidenceBadge = (confidence: number | null | undefined) => {
    if (confidence == null) return <span className="text-xs text-muted-foreground">-</span>;
    const pct = Math.round(confidence * 100);
    let color = 'bg-green-100 text-green-700';
    if (pct < 50) color = 'bg-red-100 text-red-700';
    else if (pct < 80) color = 'bg-yellow-100 text-yellow-700';
    return (
      <Badge variant="outline" className={`text-[11px] ${color}`}>
        {pct}%
      </Badge>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Icon icon="mdi:clipboard-check" width={22} height={22} className="text-primary" />
            审核管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI 检测为疑似违规的内容，需要人工复审
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <Icon icon="mdi:refresh" width={16} height={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Card className="overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>标题 / 内容</TableHead>
              <TableHead className="w-20">作者</TableHead>
              <TableHead className="w-24">AI 置信度</TableHead>
              <TableHead className="w-24">违规类型</TableHead>
              <TableHead className="w-28 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-64 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.list.length > 0 ? (
              data.list.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="text-xs text-muted-foreground">#{post.id}</TableCell>
                  <TableCell>
                    <div className="max-w-sm">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      {post.content && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {post.content}
                        </p>
                      )}
                      {post.createdAt && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{post.authorNickname}</span>
                  </TableCell>
                  <TableCell>
                    {confidenceBadge(post.moderationLog?.confidence)}
                  </TableCell>
                  <TableCell>
                    {post.moderationLog?.violationType ? (
                      <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">
                        {post.moderationLog.violationType}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => setModerateTarget({ postId: post.id, action: 'approve' })}
                      >
                        <Icon icon="mdi:check-circle" width={15} height={15} className="mr-1" />
                        通过
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setModerateTarget({ postId: post.id, action: 'reject' })}
                      >
                        <Icon icon="mdi:close-circle" width={15} height={15} className="mr-1" />
                        拒绝
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleViewLogs(post.id)}
                        title="查看审核日志"
                      >
                        <Icon icon="mdi:history" width={15} height={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Icon icon="mdi:clipboard-check-outline" width={32} height={32} />
                    <span className="text-sm">暂无待审核帖子</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {data.total > 0 && (
        <div className="flex items-center justify-between shrink-0">
          <span className="text-sm text-muted-foreground">
            共 {data.total} 篇待审核
          </span>
          {totalPages > 1 && (
            <Pagination
              page={page}
              total={data.total}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          )}
        </div>
      )}

      {/* Moderate Confirm Dialog */}
      <AlertDialog
        open={!!moderateTarget}
        onOpenChange={(v) => !v && setModerateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {moderateTarget?.action === 'approve' ? '确认通过审核' : '确认拒绝'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {moderateTarget?.action === 'approve'
                ? '帖子将直接发布，不再进入审核队列。'
                : '帖子将被标记为违规，作者将看到违规状态。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {moderateTarget?.action === 'reject' && (
            <div className="mt-2">
              <label className="text-sm font-medium">拒绝原因（可选）</label>
              <Textarea
                placeholder="输入拒绝原因..."
                value={moderateReason}
                onChange={(e) => setModerateReason(e.target.value)}
                className="mt-1.5"
                rows={2}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModerateConfirm}
              disabled={moderating}
              className={
                moderateTarget?.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {moderating ? '处理中...' : moderateTarget?.action === 'approve' ? '确认通过' : '确认拒绝'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Moderation Logs Dialog */}
      <Dialog open={logsPostId !== null} onOpenChange={(v) => !v && setLogsPostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核日志</DialogTitle>
            <DialogDescription>帖子 #{logsPostId} 的审核记录</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-[400px] overflow-y-auto">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon icon="mdi:loading" width={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <Icon
                    icon={
                      log.action === 'pass'
                        ? 'mdi:check-circle'
                        : log.action === 'reject'
                          ? 'mdi:close-circle'
                          : 'mdi:alert-circle'
                    }
                    width={20}
                    height={20}
                    className={
                      log.action === 'pass'
                        ? 'text-green-600 mt-0.5'
                        : log.action === 'reject'
                          ? 'text-red-600 mt-0.5'
                          : 'text-yellow-600 mt-0.5'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {log.action === 'pass' ? '通过' : log.action === 'reject' ? '拒绝' : '待审核'}
                      </span>
                      {log.confidence != null && (
                        <Badge variant="outline" className="text-[10px]">
                          置信度 {Math.round(log.confidence * 100)}%
                        </Badge>
                      )}
                      {log.violationType && (
                        <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">
                          {log.violationType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                <Icon icon="mdi:clipboard-text-off" width={28} height={28} />
                暂无审核日志
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsPostId(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
