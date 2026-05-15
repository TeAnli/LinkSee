import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { adminApi } from '@linksee/api-client';
import type { AdminCategoryItem, CategoryManageRequest, PaginatedResponse } from '@linksee/shared';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const EMPTY_FORM: CategoryManageRequest = {
  name: '',
  icon: '',
  description: '',
  sortOrder: 0,
  themeColor: '#1890ff',
  aiPersona: '专业友好的助手',
  status: 1,
};

export function AdminCategoriesPage() {
  const [data, setData] = useState<PaginatedResponse<AdminCategoryItem>>({
    list: [],
    total: 0,
    hasMore: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryManageRequest>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listCategories({ page, size: PAGE_SIZE });
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (item: AdminCategoryItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      icon: item.icon || '',
      description: item.description || '',
      parentId: item.parentId,
      sortOrder: item.sortOrder || 0,
      themeColor: item.themeColor || '#1890ff',
      aiPersona: item.aiPersona || '专业友好的助手',
      status: item.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('请输入板块名称');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, form);
        toast.success('板块已更新');
      } else {
        await adminApi.createCategory(form);
        toast.success('板块已创建');
      }
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该板块吗？')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('板块已删除');
      fetchData();
    } catch {
      toast.error('删除失败');
    }
  };

  const updateField = (key: keyof CategoryManageRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const columns = [
    { key: 'id', label: 'ID', className: 'w-16', sortable: true },
    {
      key: 'name',
      label: '板块名称',
      render: (name: string, row: AdminCategoryItem) => (
        <div className="flex items-center gap-2">
          {row.icon && <Icon icon={row.icon} width={18} height={18} />}
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: '描述',
      render: (desc: string) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
          {desc || '-'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      label: '排序',
      className: 'w-16',
    },
    {
      key: 'status',
      label: '状态',
      render: (status: number) => (
        <Badge variant={status === 1 ? 'secondary' : 'outline'} className={status !== 1 ? 'bg-red-100 text-red-700' : ''}>
          {status === 1 ? '启用' : '禁用'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Icon icon="mdi:shape" width={22} height={22} className="text-primary" />
            板块管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">管理论坛的讨论板块</p>
        </div>
        <Button onClick={openCreate}>
          <Icon icon="mdi:plus" width={18} height={18} className="mr-1.5" />
          新建板块
        </Button>
      </div>

      <AdminDataTable
        data={data}
        columns={columns}
        onPageChange={setPage}
        currentPage={page}
        pageSize={PAGE_SIZE}
        loading={loading}
        emptyMessage="暂无板块数据"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(row)}
              title="编辑"
            >
              <Icon icon="mdi:pencil" width={16} height={16} className="text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDelete(row.id)}
              title="删除"
            >
              <Icon icon="mdi:delete" width={16} height={16} className="text-destructive" />
            </Button>
          </div>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑板块' : '新建板块'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改板块的基本信息' : '创建一个新的讨论板块'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold">
                板块名称 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="例如：技术交流"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold">图标</label>
                <div className="relative">
                  <Input
                    placeholder="mdi:code-tags"
                    value={form.icon}
                    onChange={(e) => updateField('icon', e.target.value)}
                    className="pl-10 font-mono text-sm"
                  />
                  {form.icon && (
                    <Icon
                      icon={form.icon}
                      width={18}
                      height={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold">主题色</label>
                <div className="flex items-center gap-2">
                  <div
                    className="size-6 rounded-md border shrink-0"
                    style={{ backgroundColor: form.themeColor }}
                  />
                  <Input
                    value={form.themeColor}
                    onChange={(e) => updateField('themeColor', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold">描述</label>
              <Textarea
                placeholder="板块的简要描述"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold">排序</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => updateField('sortOrder', Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold">父板块</label>
                <Input
                  type="number"
                  placeholder="无"
                  value={form.parentId ?? ''}
                  onChange={(e) =>
                    updateField('parentId', e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold">状态</label>
                <Select
                  value={String(form.status)}
                  onValueChange={(v) => updateField('status', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold">AI 角色</label>
              <Input
                placeholder="专业友好的助手"
                value={form.aiPersona}
                onChange={(e) => updateField('aiPersona', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Icon icon="mdi:loading" width={16} className="animate-spin mr-1.5" />
              ) : null}
              {editingId ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
