import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Category } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';
import { toast } from 'sonner';
import { useUiStore } from '@/stores/useUiStore';
import { sheetOverlay, sheetPanel } from '@/lib/animation';

// === Constants ===

const DRAFT_KEY = 'linksee-draft';
const AUTO_SAVE_INTERVAL = 30_000;

const PROSE_CLASSES = 'prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-li:marker:text-primary not-prose:pre';

// === Helpers ===

function getFlatCategories(categories: Category[]): { id: number; name: string; icon: string }[] {
  const result: { id: number; name: string; icon: string }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, icon: cat.icon });
    if (cat.children) {
      for (const child of cat.children) {
        result.push({ id: child.id, name: `${cat.name} / ${child.name}`, icon: child.icon });
      }
    }
  }
  return result;
}

function estimateReadingTime(text: string): number {
  const cleaned = text.replace(/\s/g, '');
  return Math.max(1, Math.ceil(cleaned.length / 300));
}

// === Toolbar ===

interface ToolbarItem { icon: string; snippet: string; labelKey: string }

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { icon: 'mdi:format-bold', snippet: '**', labelKey: 'create.bold' },
  { icon: 'mdi:format-italic', snippet: '*', labelKey: 'create.italic' },
  { icon: 'mdi:format-strikethrough', snippet: '~~', labelKey: 'create.strikethrough' },
];
const TOOLBAR_HEADINGS: ToolbarItem[] = [
  { icon: 'mdi:format-header-1', snippet: '# ', labelKey: 'create.heading1' },
  { icon: 'mdi:format-header-2', snippet: '## ', labelKey: 'create.heading2' },
  { icon: 'mdi:format-header-3', snippet: '### ', labelKey: 'create.heading3' },
];
const TOOLBAR_INSERTS: ToolbarItem[] = [
  { icon: 'mdi:format-list-bulleted', snippet: '- ', labelKey: 'create.unorderedList' },
  { icon: 'mdi:format-list-numbered', snippet: '1. ', labelKey: 'create.orderedList' },
  { icon: 'mdi:format-quote-close', snippet: '> ', labelKey: 'create.quote' },
  { icon: 'mdi:code-tags', snippet: '`', labelKey: 'create.inlineCode' },
  { icon: 'mdi:code-block-tags', snippet: '```\n\n```', labelKey: 'create.codeBlock' },
  { icon: 'mdi:table', snippet: '| Header | Header |\n| --- | --- |\n| Cell | Cell |', labelKey: 'create.table' },
  { icon: 'mdi:link-variant', snippet: '[text](url)', labelKey: 'create.link' },
  { icon: 'mdi:image-outline', snippet: '![alt](url)', labelKey: 'create.image' },
  { icon: 'mdi:function-variant', snippet: '$$', labelKey: 'create.mathFormula' },
];

function ToolbarButton({ icon, snippet, label }: { icon: string; snippet: string; label: string }) {
  const insertSnippet = useCallback(() => {
    const textarea = document.getElementById('md-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
    textarea.value = newContent;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => {
      textarea.focus();
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  }, [snippet]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={insertSnippet}
          className="flex items-center justify-center size-7 rounded-md hover:bg-muted/80 transition-colors cursor-pointer group"
        >
          <Icon icon={icon} width={16} className="text-muted-foreground group-hover:text-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

const Divider = () => <Separator orientation="vertical" className="h-5 mx-1" />;

// === Preview ===

function PreviewPane({ content, emptyText }: { content: string; emptyText: string }) {
  if (!content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-3">
        <Icon icon="mdi:file-eye-outline" width={48} />
        <span className="text-sm">{emptyText}</span>
      </div>
    );
  }
  return (
    <div className={PROSE_CLASSES}>
      <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeHighlight, rehypeKatex]}>
        {content}
      </Markdown>
    </div>
  );
}

// === Settings Panel Content (shared between desktop sidebar and mobile sheet) ===

function SettingsPanel({
  categoryId, setCategoryId,
  tags, tagInput, setTagInput,
  showTagPopover, setShowTagPopover,
  filteredTagSuggestions, onAddTag, onRemoveTag,
  coverImageUrl, setCoverImageUrl,
  summary, setSummary,
  canPublish, isPublishing,
  onPublish, onSaveDraft,
  compact,
  categories, flatCategories,
}: {
  categoryId: string; setCategoryId: (v: string) => void;
  tags: string[]; tagInput: string; setTagInput: (v: string) => void;
  showTagPopover: boolean; setShowTagPopover: (v: boolean) => void;
  filteredTagSuggestions: string[];
  onAddTag: (tag: string) => void; onRemoveTag: (tag: string) => void;
  coverImageUrl: string; setCoverImageUrl: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
  canPublish: boolean; isPublishing: boolean;
  onPublish: () => void; onSaveDraft: () => void;
  compact?: boolean;
  categories: Category[];
  flatCategories: { id: number; name: string; icon: string }[];
}) {
  const { t } = useTranslation();
  const selectedCategory = flatCategories.find((c) => c.id === Number(categoryId));

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      onAddTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]!);
    }
  }, [tagInput, tags, onAddTag, onRemoveTag]);

  return (
    <div className={cn('flex flex-col gap-4', compact ? 'p-4' : 'p-5')}>
      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t('create.selectCategory')}
        </label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-8 text-xs gap-2 w-full">
            <Icon icon={selectedCategory?.icon ?? 'mdi:folder-outline'} width={14} />
            <SelectValue placeholder={t('create.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectGroup key={cat.id}>
                <SelectLabel className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Icon icon={cat.icon} width={14} />
                  {cat.name}
                </SelectLabel>
                {cat.children && cat.children.length > 0
                  ? cat.children.map((child) => (
                      <SelectItem key={child.id} value={String(child.id)} className="text-xs pl-8">
                        {child.name}
                      </SelectItem>
                    ))
                  : (
                    <SelectItem key={cat.id} value={String(cat.id)} className="text-xs pl-8">
                      {cat.name}
                    </SelectItem>
                  )}
                <SelectSeparator />
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t('create.addTags')}
        </label>
        <Popover open={showTagPopover && filteredTagSuggestions.length > 0} onOpenChange={setShowTagPopover}>
          <PopoverTrigger asChild>
            <div
              className="flex items-center gap-1.5 flex-wrap min-h-[32px] px-2.5 py-1 rounded-lg border border-border bg-background text-sm cursor-text transition-colors hover:border-primary/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
              onClick={() => document.getElementById('settings-tag-input')?.focus()}
            >
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px] px-1.5 py-0 gap-0.5">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveTag(tag); }}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Icon icon="mdi:close" width={12} />
                  </button>
                </Badge>
              ))}
              {tags.length < 5 && (
                <input
                  id="settings-tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => setShowTagPopover(true)}
                  placeholder={tags.length === 0 ? t('create.addTags') : ''}
                  className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50 text-foreground"
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1.5" align="start">
            <div className="flex flex-col gap-0.5">
              {filteredTagSuggestions.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onAddTag(tag)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors cursor-pointer text-left w-full"
                >
                  <Icon icon="mdi:tag-outline" width={14} className="text-muted-foreground" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Cover Image URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t('create.coverImage')}
        </label>
        <Input
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder={t('create.coverImageHint')}
          className="h-8 text-xs"
        />
        {coverImageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-muted/30">
            <img
              src={coverImageUrl}
              alt="cover preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t('create.summary')}
        </label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value.slice(0, 200))}
          placeholder={t('create.summaryHint')}
          className="resize-none h-16 text-xs"
        />
        <span className="text-[10px] text-muted-foreground self-end">{summary.length}/200</span>
      </div>

      {/* Publish Checklist */}
      <div className="rounded-lg border border-border p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon icon="mdi:check-decagram" width={14} className="text-primary" />
          <span className="text-[11px] font-bold text-foreground">{t('create.publishCheck')}</span>
        </div>
        <CheckItem label={t('create.checkCategory')} ok={!!categoryId} value={selectedCategory?.name} />
        <CheckItem label={t('create.checkTags')} ok={tags.length > 0} value={tags.length > 0 ? t('create.tagsCount', { count: tags.length }) : undefined} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button size="sm" disabled={!canPublish || isPublishing} onClick={onPublish} className="w-full">
          {isPublishing
            ? <Icon icon="mdi:loading" width={16} className="animate-spin" />
            : <Icon icon="mdi:send" width={16} />}
          {t('create.publish')}
        </Button>
        <Button variant="outline" size="sm" onClick={onSaveDraft} className="w-full">
          <Icon icon="mdi:content-save-outline" width={16} />
          {t('create.draft')}
        </Button>
      </div>
    </div>
  );
}

// === CheckItem ===

function CheckItem({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Icon
        icon={ok ? 'mdi:checkbox-marked-circle' : 'mdi:checkbox-blank-circle-outline'}
        width={14}
        className={ok ? 'text-green-500 shrink-0' : 'text-muted-foreground/50 shrink-0'}
      />
      <span className="text-[11px] text-foreground flex-1">{label}</span>
      {value !== undefined && (
        <span className={cn('text-[10px]', ok ? 'text-muted-foreground' : 'text-destructive/70')}>
          {value}
        </span>
      )}
    </div>
  );
}

// === Main Page ===

export function CreatePostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Core form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [desktopTab, setDesktopTab] = useState<string>('split');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showTagPopover, setShowTagPopover] = useState(false);

  // New customization state
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [categories, setCategories] = useState<Category[]>([]);
  const flatCategories = useMemo(() => getFlatCategories(categories), [categories]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await forumApi.listCategories();
        if (!cancelled) {
          const raw = res.data.data;
          setCategories(Array.isArray(raw) ? raw : []);
        }
      } catch {}
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const tagSuggestions = useMemo(() => {
    const allTags = new Set<string>();
    categories.forEach((cat) => {
      if (cat.children) {
        cat.children.forEach((child) => {
          child.name.split(/[\/&]/).forEach((t) => { if (t.trim()) allTags.add(t.trim()); });
        });
      }
      cat.name.split(/[\/&]/).forEach((t) => { if (t.trim()) allTags.add(t.trim()); });
    });
    return Array.from(allTags);
  }, [categories]);

  const filteredTagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return tagSuggestions;
    return tagSuggestions.filter(
      (tg) => tg.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tg),
    );
  }, [tagInput, tags, tagSuggestions]);

  const handleAddTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
      setShowTagPopover(false);
    }
  }, [tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((tg) => tg !== tag));
  }, []);

  const canPublish = !!(title.trim() && categoryId && content.trim());

  // === Auto-save draft ===

  const draftPayload = useMemo(() => ({
    title, categoryId, tags, content, coverImageUrl, summary,
  }), [title, categoryId, tags, content, coverImageUrl, summary]);

  useEffect(() => {
    const save = () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    };
    const interval = setInterval(save, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [draftPayload]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.title) setTitle(draft.title);
      if (draft.categoryId) setCategoryId(draft.categoryId);
      if (draft.tags?.length) setTags(draft.tags);
      if (draft.content) setContent(draft.content);
      if (draft.coverImageUrl) setCoverImageUrl(draft.coverImageUrl);
      if (draft.summary) setSummary(draft.summary);
      toast.info(t('create.draftRestored'));
    } catch { /* corrupt JSON, ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear draft after successful publish
  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  // === Fullscreen toggle ===

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    toggleSidebar();
  }, [toggleSidebar]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    toggleSidebar();
  }, [toggleSidebar]);

  // === Publish ===

  const handlePublish = async () => {
    if (!canPublish) return;
    setIsPublishing(true);
    try {
      const res = await forumApi.createPost({
        categoryId: Number(categoryId),
        title: title.trim(),
        content: content.trim(),
        tagList: tags.length > 0 ? tags : undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
      });
      clearDraft();
      toast.success(res.data.message || t('create.publishSuccess'));
      navigate(`/post/${res.data.data.postId}`);
    } catch {
      toast.error(t('create.publishFailed'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    toast.info(t('create.autoSaved'));
  };

  // === Computed ===

  const charCount = content.length;
  const lineCount = content.split(/\n+/).filter(Boolean).length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = estimateReadingTime(content);

  const settingsPanelProps = {
    categoryId, setCategoryId,
    tags, tagInput, setTagInput,
    showTagPopover, setShowTagPopover,
    filteredTagSuggestions,
    onAddTag: handleAddTag,
    onRemoveTag: handleRemoveTag,
    coverImageUrl, setCoverImageUrl,
    summary, setSummary,
    canPublish, isPublishing,
    onPublish: handlePublish,
    onSaveDraft: handleSaveDraft,
    categories, flatCategories,
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-[calc(100vh-60px)] flex flex-col overflow-hidden">
        {/* ===== Top bar (inline) ===== */}
        <div className="flex items-center justify-between shrink-0 px-4 py-2 border-b-[1.5px] border-border bg-background">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="size-8 shrink-0">
              <Icon icon="mdi:arrow-left" width={18} />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-sm font-extrabold text-foreground truncate">{t('create.title')}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile settings toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 lg:hidden"
              onClick={() => setMobileSettingsOpen(true)}
            >
              <Icon icon="mdi:cog-outline" width={18} />
            </Button>

            {/* Fullscreen toggle (desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hidden lg:flex"
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            >
              <Icon icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} width={18} />
            </Button>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="flex flex-1 min-h-0">
          {/* ===== Main Editor ===== */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Title input */}
            <div className="shrink-0 px-4 pt-3 pb-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create.enterTitle')}
                maxLength={100}
                className="w-full text-xl font-extrabold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-muted-foreground">{t('create.titleHint')}</p>
                <span className={cn(
                  'text-[11px] tabular-nums',
                  title.length > 90 ? 'text-destructive font-bold' : 'text-muted-foreground',
                )}>
                  {title.length}/100
                </span>
              </div>
            </div>

            {/* Toolbar + Editor */}
            <div className="flex flex-col flex-1 min-h-0 border-t-[1.5px] border-border">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-1.5 border-b-[1.5px] border-border bg-muted/30 flex-wrap shrink-0">
                {/* View mode toggle (desktop) */}
                <div className="hidden md:flex items-center mr-2">
                  <Tabs value={desktopTab} onValueChange={setDesktopTab}>
                    <TabsList className="h-7 p-0.5 bg-muted/60">
                      <TabsTrigger value="split" className="h-6 px-2 text-[11px] gap-1">
                        <Icon icon="mdi:view-split-horizontal" width={13} />
                        {t('create.split')}
                      </TabsTrigger>
                      <TabsTrigger value="edit" className="h-6 px-2 text-[11px] gap-1">
                        <Icon icon="mdi:pencil-outline" width={13} />
                        {t('create.edit')}
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="h-6 px-2 text-[11px] gap-1">
                        <Icon icon="mdi:eye-outline" width={13} />
                        {t('create.preview')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Divider />
                {TOOLBAR_ITEMS.map((item) => (
                  <ToolbarButton key={item.labelKey} icon={item.icon} snippet={item.snippet} label={t(item.labelKey)} />
                ))}
                <Divider />
                {TOOLBAR_HEADINGS.map((item) => (
                  <ToolbarButton key={item.labelKey} icon={item.icon} snippet={item.snippet} label={t(item.labelKey)} />
                ))}
                <Divider />
                {TOOLBAR_INSERTS.map((item) => (
                  <ToolbarButton key={item.labelKey} icon={item.icon} snippet={item.snippet} label={t(item.labelKey)} />
                ))}

                {/* Mobile tab switch */}
                <div className="md:hidden ml-auto">
                  <Tabs value={desktopTab === 'preview' ? 'preview' : 'edit'} onValueChange={setDesktopTab}>
                    <TabsList className="h-7 p-0.5 bg-muted/60">
                      <TabsTrigger value="edit" className="h-6 px-2.5 text-[11px]">
                        {t('create.edit')}
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="h-6 px-2.5 text-[11px]">
                        {t('create.preview')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Editor + Preview */}
              <div className="flex flex-1 min-h-0">
                {(desktopTab === 'split' || desktopTab === 'edit') && (
                  <div className="flex flex-col flex-1 min-h-0">
                    <Textarea
                      id="md-editor"
                      ref={editorRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('create.placeholder')}
                      className={cn(
                        'flex-1 resize-none border-none shadow-none ring-none rounded-none',
                        'focus-visible:ring-0 focus-visible:ring-offset-0',
                        'bg-transparent text-sm leading-relaxed font-mono p-4',
                        'placeholder:text-muted-foreground/40',
                      )}
                    />
                  </div>
                )}

                {(desktopTab === 'split' || desktopTab === 'preview') && (
                  <div className={cn(
                    'flex flex-col flex-1 min-h-0 border-l-[1.5px] border-border',
                    desktopTab === 'preview' && 'border-l-0',
                  )}>
                    <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-border bg-muted/20 shrink-0">
                      <Icon icon="mdi:eye-outline" width={14} className="text-muted-foreground" />
                      <span className="text-[11px] font-semibold text-muted-foreground">{t('create.preview')}</span>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        <PreviewPane content={content} emptyText={t('create.startTyping')} />
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t-[1.5px] border-border bg-muted/20 shrink-0">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground tabular-nums">
                <span>{charCount} {t('create.characters')}</span>
                <span>{lineCount} {t('create.lines')}</span>
                <span>{wordCount} {t('create.words')}</span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <Icon icon="mdi:clock-outline" width={12} />
                  {t('create.approxMinutes', { minutes: readingTime })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Markdown</span>
                {tags.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {tags.length} {t('create.tags')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ===== Desktop Settings Sidebar ===== */}
          {!isFullscreen && (
            <aside className="hidden lg:flex flex-col w-80 border-l-[1.5px] border-border bg-background shrink-0">
              <div className="flex items-center justify-between px-4 py-2.5 border-b-[1.5px] border-border shrink-0">
                <div className="flex items-center gap-1.5">
                  <Icon icon="mdi:cog-outline" width={16} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">{t('create.settings')}</span>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <SettingsPanel {...settingsPanelProps} />
              </ScrollArea>
            </aside>
          )}
        </div>

        {/* ===== Mobile Settings Bottom Sheet ===== */}
        <AnimatePresence>
          {mobileSettingsOpen && (
            <>
              <motion.div
                variants={sheetOverlay}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={() => setMobileSettingsOpen(false)}
              />
              <motion.div
                variants={sheetPanel}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-2xl border-t-[1.5px] border-border max-h-[80vh] flex flex-col"
                style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                  <div className="w-8 h-1 rounded-full bg-muted-foreground/25" />
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-b-[1.5px] border-border shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Icon icon="mdi:cog-outline" width={16} className="text-primary" />
                    <span className="text-xs font-bold text-foreground">{t('create.settings')}</span>
                  </div>
                  <button
                    onClick={() => setMobileSettingsOpen(false)}
                    className="size-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Icon icon="mdi:close" width={16} />
                  </button>
                </div>
                <ScrollArea className="flex-1">
                  <SettingsPanel {...settingsPanelProps} compact />
                </ScrollArea>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
