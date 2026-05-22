import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Pagination } from '@/components/ui/pagination';
import { adminApi } from '@linksee/api-client';
import type { SensitiveWordItem, PaginatedResponse } from '@linksee/shared';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

const CATEGORY_COLORS: Record<string, string> = {
  政治类型: 'bg-red-100 text-red-700 border-red-200',
  色情类型: 'bg-pink-100 text-pink-700 border-pink-200',
  暴恐词库: 'bg-orange-100 text-orange-700 border-orange-200',
  反动词库: 'bg-amber-100 text-amber-700 border-amber-200',
  广告类型: 'bg-purple-100 text-purple-700 border-purple-200',
  贪腐词库: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  民生词库: 'bg-blue-100 text-blue-700 border-blue-200',
  涉枪涉爆: 'bg-slate-100 text-slate-700 border-slate-200',
  非法网址: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

function getCategoryBadge(category: string) {
  const colors = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <Badge variant="outline" className={`text-[11px] shrink-0 ${colors}`}>
      {category}
    </Badge>
  );
}

export function AdminSensitiveWordsPage() {
  // ===== Table mode state =====
  const [data, setData] = useState<PaginatedResponse<SensitiveWordItem>>({ list: [], total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState('');
  const [addWordsText, setAddWordsText] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{ category: string; word: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Categories (extracted from data)
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listSensitiveWords({ keyword: keyword || undefined, page, size: PAGE_SIZE });
      const result = res.data.data;
      setData(result);

      const cats = new Set<string>();
      result.list.forEach((item) => cats.add(item.category));
      setAllCategories((prev) => {
        const merged = new Set([...prev, ...cats]);
        return Array.from(merged).sort();
      });
    } catch {
      toast.error('加载敏感词失败');
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setKeyword('');
    setPage(1);
  };

  const handleAdd = async () => {
    if (!addCategory.trim()) {
      toast.error('请选择或输入分类');
      return;
    }
    const words = addWordsText
      .split(/[\n,，]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    if (words.length === 0) {
      toast.error('请输入至少一个敏感词');
      return;
    }
    setAdding(true);
    try {
      const res = await adminApi.addSensitiveWords({ category: addCategory.trim(), words });
      toast.success(`已添加 ${res.data.data.added} 个敏感词到「${addCategory.trim()}」`);
      setAddOpen(false);
      setAddCategory('');
      setAddWordsText('');
      setAllCategories((prev) => {
        if (!prev.includes(addCategory.trim())) {
          return [...prev, addCategory.trim()].sort();
        }
        return prev;
      });
      fetchData();
    } catch {
      toast.error('添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSensitiveWord(deleteTarget);
      toast.success(`已删除敏感词「${deleteTarget.word}」`);
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // ===== JSON editor state =====
  const [raw, setRaw] = useState('');
  const [rawLoading, setRawLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRaw = useCallback(async () => {
    try {
      setRawLoading(true);
      const res = await adminApi.getSensitiveWordsRaw();
      setRaw(res.data.data.raw);
    } catch {
      toast.error('加载词库失败');
    } finally {
      setRawLoading(false);
    }
  }, []);

  const isValidJson = (() => {
    try {
      JSON.parse(raw);
      return true;
    } catch {
      return false;
    }
  })();

  const rawStats = (() => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
      const categories = Object.keys(parsed).length;
      const words = Object.values(parsed).reduce(
        (sum: number, arr: unknown) => sum + (Array.isArray(arr) ? arr.length : 0),
        0,
      );
      return { categories, words };
    } catch {
      return null;
    }
  })();

  const handleSaveRaw = async () => {
    if (!raw.trim()) {
      toast.error('内容不能为空');
      return;
    }
    if (!isValidJson) {
      toast.error('JSON 格式错误，请检查语法');
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveSensitiveWordsRaw({ raw });
      toast.success('词库已保存并立即生效');
      fetchData();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(raw);
      setRaw(JSON.stringify(parsed, null, 2));
    } catch {
      toast.error('JSON 格式错误，无法格式化');
    }
  };

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Icon icon="mdi:shield-alert" width={22} height={22} className="text-primary" />
            敏感词库
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理 DFA 敏感词过滤器词库，修改后即时生效
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="table"
        className="flex-1 flex flex-col min-h-0"
        onValueChange={(v) => { if (v === 'json') fetchRaw(); }}
      >
        <TabsList className="shrink-0 w-fit">
          <TabsTrigger value="table">词汇管理</TabsTrigger>
          <TabsTrigger value="json">JSON 编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="flex-1 flex flex-col min-h-0 mt-4 space-y-4">
          {/* Search + Add */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Icon
                icon="mdi:search"
                width={18}
                height={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="搜索敏感词"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-8"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClearSearch}
                >
                  <Icon icon="mdi:close" width={14} height={14} />
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              搜索
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Icon icon="mdi:plus" width={16} height={16} className="mr-1" />
              添加词汇
            </Button>
          </div>

          {/* Table */}
          <Card className="overflow-hidden flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">分类</TableHead>
                  <TableHead>敏感词</TableHead>
                  <TableHead className="w-16 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell><div className="h-5 w-16 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-5 w-32 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data.list.length > 0 ? (
                  data.list.map((item, idx) => (
                    <TableRow key={`${item.category}-${item.word}-${idx}`}>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell className="font-mono text-sm">{item.word}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => setDeleteTarget({ category: item.category, word: item.word })}
                        >
                          <Icon icon="mdi:delete-outline" width={16} height={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Icon icon="mdi:database-off" width={32} height={32} />
                        <span className="text-sm">
                          {keyword ? `未找到包含「${keyword}」的敏感词` : '词库为空'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {data.total > 0 && (
            <div className="flex items-center justify-between shrink-0">
              <span className="text-sm text-muted-foreground">
                共 {data.total} 个敏感词
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
        </TabsContent>

        <TabsContent value="json" className="flex-1 flex flex-col min-h-0 mt-4 space-y-4">
          {rawStats && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:folder" width={14} height={14} />
                {rawStats.categories} 个分类
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:text-box" width={14} height={14} />
                {rawStats.words.toLocaleString()} 个词
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:code-json" width={14} height={14} />
                {(new Blob([raw]).size / 1024).toFixed(0)} KB
              </span>
              {!isValidJson && raw && (
                <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                  <Icon icon="mdi:alert-circle" width={14} height={14} />
                  JSON 格式错误
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleFormat}>
              <Icon icon="mdi:format-align-left" width={16} height={16} className="mr-1.5" />
              格式化
            </Button>
            <Button size="sm" onClick={handleSaveRaw} disabled={saving}>
              {saving ? (
                <Icon icon="mdi:loading" width={16} className="animate-spin mr-1.5" />
              ) : (
                <Icon icon="mdi:content-save" width={16} height={16} className="mr-1.5" />
              )}
              保存并生效
            </Button>
          </div>

          {rawLoading ? (
            <div className="flex items-center justify-center flex-1 min-h-[400px]">
              <Icon icon="mdi:loading" width={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="flex-1 min-h-[500px] font-mono text-xs leading-relaxed resize-none"
              placeholder="{}"
              spellCheck={false}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Word Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加敏感词</DialogTitle>
            <DialogDescription>选择或输入分类，每行一个词或用逗号分隔</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">分类</label>
              <div className="flex gap-2 mt-1.5">
                <Select value={addCategory} onValueChange={setAddCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择已有分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="或输入新分类名"
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">敏感词</label>
              <Textarea
                placeholder="每行一个词，或用逗号分隔"
                value={addWordsText}
                onChange={(e) => setAddWordsText(e.target.value)}
                className="mt-1.5 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? '添加中...' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除敏感词「{deleteTarget?.word}」吗？此操作立即生效。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
