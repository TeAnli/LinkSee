import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@linksee/api-client';
import { toast } from 'sonner';

export function AdminSensitiveWordsPage() {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRaw = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSensitiveWordsRaw();
      setRaw(res.data.data.raw);
    } catch {
      toast.error('加载词库失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRaw();
  }, [fetchRaw]);

  const stats = useMemo(() => {
    try {
      const data = JSON.parse(raw);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
      const categories = Object.keys(data).length;
      const words = Object.values(data).reduce(
        (sum: number, arr: unknown) => sum + (Array.isArray(arr) ? arr.length : 0),
        0,
      );
      return { categories, words };
    } catch {
      return null;
    }
  }, [raw]);

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(raw);
      return true;
    } catch {
      return false;
    }
  }, [raw]);

  const handleSave = async () => {
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

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Icon icon="mdi:shield-alert" width={22} height={22} className="text-primary" />
            敏感词库
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            直接编辑 JSON 源文件，保存后即时生效
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleFormat}>
            <Icon icon="mdi:format-align-left" width={16} height={16} className="mr-1.5" />
            格式化
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Icon icon="mdi:loading" width={16} className="animate-spin mr-1.5" />
            ) : (
              <Icon icon="mdi:content-save" width={16} height={16} className="mr-1.5" />
            )}
            保存
          </Button>
        </div>
      </div>

      {stats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:folder" width={14} height={14} />
            {stats.categories} 个分类
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:text-box" width={14} height={14} />
            {stats.words.toLocaleString()} 个词
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:code-json" width={14} height={14} />
            {(new Blob([raw]).size / 1024).toFixed(0)} KB
          </span>
          {!isValidJson && (
            <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
              <Icon icon="mdi:alert-circle" width={14} height={14} />
              JSON 格式错误
            </span>
          )}
        </div>
      )}

      {loading ? (
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
    </div>
  );
}
