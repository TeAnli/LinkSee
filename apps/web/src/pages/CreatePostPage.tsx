import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { mockCategories, mockTags } from '@/mock/data';
import type { Category } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';
import { toast } from 'sonner';

// === Animation ===
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

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

const FLAT_CATEGORIES = getFlatCategories(mockCategories);
const TAG_SUGGESTIONS = mockTags.map((t) => t.name);

const PROSE_CLASSES = 'prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-li:marker:text-primary not-prose:pre';

// === Toolbar Items (labels use i18n keys) ===
const TOOLBAR_ITEMS: { icon: string; snippet: string; labelKey: string; shortcut?: string }[] = [
  { icon: 'mdi:format-bold', snippet: '**', labelKey: 'create.bold', shortcut: 'Ctrl+B' },
  { icon: 'mdi:format-italic', snippet: '*', labelKey: 'create.italic', shortcut: 'Ctrl+I' },
  { icon: 'mdi:format-strikethrough', snippet: '~~', labelKey: 'create.strikethrough' },
];
const TOOLBAR_HEADINGS: { icon: string; snippet: string; labelKey: string }[] = [
  { icon: 'mdi:format-header-1', snippet: '# ', labelKey: 'create.heading1' },
  { icon: 'mdi:format-header-2', snippet: '## ', labelKey: 'create.heading2' },
  { icon: 'mdi:format-header-3', snippet: '### ', labelKey: 'create.heading3' },
];
const TOOLBAR_INSERTS: { icon: string; snippet: string; labelKey: string }[] = [
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
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => {
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
          }}
          className="flex items-center justify-center size-8 rounded-md hover:bg-muted/80 transition-colors cursor-pointer group"
        >
          <Icon icon={icon} width={16} className="text-muted-foreground group-hover:text-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <Separator orientation="vertical" className="h-5 mx-1" />;
}

// === Preview Component ===
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

// === Main Page ===

export function CreatePostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [desktopTab, setDesktopTab] = useState<string>('split');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showTagPopover, setShowTagPopover] = useState(false);

  const selectedCategory = FLAT_CATEGORIES.find((c) => c.id === Number(categoryId));

  const filteredTagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return TAG_SUGGESTIONS;
    return TAG_SUGGESTIONS.filter(
      (tg) => tg.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tg),
    );
  }, [tagInput, tags]);

  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
        setTags((prev) => [...prev, trimmed]);
        setTagInput('');
        setShowTagPopover(false);
      }
    },
    [tags],
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((tg) => tg !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        handleAddTag(tagInput);
      }
      if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
        setTags((prev) => prev.slice(0, -1));
      }
    },
    [tagInput, tags, handleAddTag],
  );

  const canPublish = title.trim() && categoryId && content.trim();

  const handlePublish = async () => {
    if (!canPublish) return;
    setIsPublishing(true);
    try {
      const res = await forumApi.createPost({
        categoryId: Number(categoryId),
        title: title.trim(),
        content: content.trim(),
        tagList: tags.length > 0 ? tags : undefined,
      });
      toast.success(res.data.message || t('create.publishSuccess'));
      navigate(`/post/${res.data.data.postId}`);
    } catch {
      toast.error(t('create.publishFailed'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) return;
    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsPublishing(false);
  };

  const charCount = content.length;
  const lineCount = content.split(/\n+/).filter(Boolean).length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {/* ===== Header Bar ===== */}
          <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="size-8">
                <Icon icon="mdi:arrow-left" width={18} />
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <h1 className="text-lg font-extrabold text-foreground">{t('create.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!title.trim() || isPublishing} onClick={handleSaveDraft}>
                {isPublishing ? (
                  <Icon icon="mdi:loading" width={16} className="animate-spin" />
                ) : (
                  <Icon icon="mdi:content-save-outline" width={16} />
                )}
                {t('create.draft')}
              </Button>
              <Button size="sm" disabled={!canPublish || isPublishing} onClick={handlePublish}>
                {isPublishing ? (
                  <Icon icon="mdi:loading" width={16} className="animate-spin" />
                ) : (
                  <Icon icon="mdi:send" width={16} />
                )}
                {t('create.publish')}
              </Button>
            </div>
          </motion.div>

          {/* ===== Title ===== */}
          <motion.div variants={fadeUp}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('create.enterTitle')}
              maxLength={100}
              className="w-full text-xl sm:text-2xl font-extrabold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted-foreground">{t('create.titleHint')}</p>
              <span className={cn('text-xs tabular-nums', title.length > 90 ? 'text-destructive font-bold' : 'text-muted-foreground')}>
                {title.length}/100
              </span>
            </div>
          </motion.div>

          {/* ===== Meta: Category + Tags ===== */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            {/* Category */}
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[200px] h-8 text-xs gap-2">
                <Icon icon={selectedCategory?.icon ?? 'mdi:folder-outline'} width={14} />
                <SelectValue placeholder={t('create.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map((cat) => (
                  <SelectGroup key={cat.id}>
                    <SelectLabel className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Icon icon={cat.icon} width={14} />
                      {cat.name}
                    </SelectLabel>
                    {cat.children && cat.children.length > 0 ? (
                      cat.children.map((child) => (
                        <SelectItem key={child.id} value={String(child.id)} className="text-xs pl-8">
                          {child.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key={cat.id} value={String(cat.id)} className="text-xs pl-8">
                        {cat.name}
                      </SelectItem>
                    )}
                    <SelectSeparator />
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {/* Tags */}
            <Popover open={showTagPopover && filteredTagSuggestions.length > 0} onOpenChange={setShowTagPopover}>
              <PopoverTrigger asChild>
                <div
                  className="flex items-center gap-1.5 flex-wrap min-h-[32px] px-2.5 py-1 rounded-lg border border-border bg-background text-sm cursor-text transition-colors hover:border-primary/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                  onClick={() => document.getElementById('tag-input')?.focus()}
                >
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px] px-1.5 py-0 gap-0.5">
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Icon icon="mdi:close" width={12} />
                      </button>
                    </Badge>
                  ))}
                  {tags.length < 5 && (
                    <input
                      id="tag-input"
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
                      onClick={() => handleAddTag(tag)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors cursor-pointer text-left w-full"
                    >
                      <Icon icon="mdi:tag-outline" width={14} className="text-muted-foreground" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* ===== Editor Card ===== */}
          <motion.div variants={fadeUp}>
            <Card className="border-[1.5px] shadow-flat overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-1.5 border-b-[1.5px] border-border bg-muted/30 flex-wrap">
                {/* Desktop view mode toggle */}
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

              {/* Editor + Preview Panes */}
              <div className="flex min-h-[520px]">
                {/* Editor Pane */}
                {(desktopTab === 'split' || desktopTab === 'edit') && (
                  <div className={cn(
                    'flex flex-col flex-1',
                    desktopTab === 'edit' && 'max-w-full',
                  )}>
                    <Textarea
                      id="md-editor"
                      ref={editorRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('create.placeholder')}
                      className={cn(
                        'flex-1 min-h-[520px] resize-none border-none shadow-none ring-none',
                        'focus-visible:ring-0 focus-visible:ring-offset-0',
                        'rounded-none bg-transparent text-sm leading-relaxed font-mono p-4',
                        'placeholder:text-muted-foreground/40',
                      )}
                    />
                  </div>
                )}

                {/* Preview Pane */}
                {(desktopTab === 'split' || desktopTab === 'preview') && (
                  <div className={cn(
                    'flex flex-col flex-1 border-l-[1.5px] border-border',
                    desktopTab === 'preview' && 'border-l-0 max-w-full',
                  )}>
                    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/20">
                      <Icon icon="mdi:eye-outline" width={14} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">{t('create.preview')}</span>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        <PreviewPane content={content} emptyText={t('create.startTyping')} />
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-t-[1.5px] border-border bg-muted/20">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                  <span>{charCount} {t('create.characters')}</span>
                  <span>{lineCount} {t('create.lines')}</span>
                  <span>{wordCount} {t('create.words')}</span>
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
            </Card>
          </motion.div>

          {/* ===== Publishing Checklist ===== */}
          {title.trim() && (
            <motion.div variants={fadeUp}>
              <Card className="border-[1.5px] shadow-flat">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Icon icon="mdi:check-decagram" width={16} className="text-primary" />
                    {t('create.publishCheck')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('create.publishCheckDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-col gap-2">
                    <CheckItem label={t('create.checkTitle')} ok={!!title.trim()} value={title} />
                    <CheckItem label={t('create.checkCategory')} ok={!!categoryId} value={selectedCategory?.name} />
                    <CheckItem label={t('create.checkTags')} ok={tags.length > 0} value={tags.length > 0 ? t('create.tagsCount', { count: tags.length }) : t('create.noTags')} />
                    <CheckItem label={t('create.checkContent')} ok={content.length >= 20} value={content.length >= 20 ? `${charCount} ${t('create.characters')}` : t('create.minCharacters')} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

// === Sub-components ===

function CheckItem({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2">
        <Icon
          icon={ok ? 'mdi:checkbox-marked-circle' : 'mdi:checkbox-blank-circle-outline'}
          width={16}
          className={ok ? 'text-green-500' : 'text-muted-foreground/50'}
        />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <span className={cn('text-xs', ok ? 'text-muted-foreground' : 'text-destructive/70')}>
        {value}
      </span>
    </div>
  );
}
