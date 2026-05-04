import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Card, CardContent } from '@/components/ui/card';
import { PostDetailSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getMockPostDetail, formatRelativeTime, formatCount } from '@/mock/data';
import 'highlight.js/styles/atom-one-dark.css';

// === Types ===

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// === Animation Variants ===

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const tocFadeIn = {
  hidden: { opacity: 0, x: 12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// === TOC Extractor ===

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    if (!match) continue;
    const [, hashes, text] = match;
    if (!hashes || !text) continue;
    const level = hashes.length;
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '');
    items.push({ id, text, level });
  }
  return items;
}

// === TOC Sidebar Component ===

function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string | null }) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex flex-col fixed right-0 border-l-[1.5px] border-border bg-background z-10"
      style={{ width: '240px', top: '76px', bottom: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-border">
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:format-list-bulleted" width={16} className="text-primary" />
          <span className="text-xs font-bold text-foreground">{t('post.toc')}</span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
            {toc.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <nav className="flex flex-col gap-0.5">
          <AnimatePresence>
            {toc.map((item, i) => (
              <motion.a
                key={item.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={tocFadeIn}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn(
                  'block text-[12px] leading-relaxed py-1 rounded-md transition-all duration-200',
                  item.level === 3 ? 'pl-4' : 'pl-2',
                  activeId === item.id
                    ? 'text-primary font-bold bg-primary/8 border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent',
                )}
              >
                {item.text}
              </motion.a>
            ))}
          </AnimatePresence>
        </nav>
      </ScrollArea>
    </aside>
  );
}

// === Post Detail Page ===

export function PostDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const post = useMemo(() => getMockPostDetail(Number(id)), [id]);
  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post]);

  // Intersection Observer for active heading tracking
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 1.0 },
    );

    const timer = setTimeout(() => {
      toc.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [toc]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const markdownComponents = useMemo(
    () => ({
      h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
        const text = String(children).replace(/[*_`#]/g, '').trim();
        const headingId = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
        return <h2 id={headingId} className="scroll-mt-20" {...props}>{children}</h2>;
      },
      h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
        const text = String(children).replace(/[*_`#]/g, '').trim();
        const headingId = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
        return <h3 id={headingId} className="scroll-mt-20" {...props}>{children}</h3>;
      },
      pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'> & { children?: React.ReactNode }) => {
        return <pre className="not-prose" {...props}>{children}</pre>;
      },
      code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { children?: React.ReactNode }) => {
        const isInline = !className;
        if (isInline) {
          return <code className="rounded bg-muted px-1 py-0.5 text-[13px]" {...props}>{children}</code>;
        }
        return <code className={className} {...props}>{children}</code>;
      },
    }),
    [],
  );

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Icon icon="mdi:file-search-outline" width={64} className="text-muted-foreground/40" />
        <p className="text-lg font-bold text-muted-foreground">{t('post.postNotFound')}</p>
        <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline cursor-pointer">
          {t('post.backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" style={{ marginRight: toc.length > 0 ? '240px' : undefined, transition: 'margin-right 0.3s ease' }}>
      <motion.div className="flex flex-col gap-4" initial="hidden" animate="visible" variants={stagger}>
        {/* Back button */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer group"
        >
          <Icon icon="mdi:arrow-left" width={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('common.back')}</span>
        </motion.button>

        {/* Post Card */}
        <Card className="border-[1.5px] rounded-xl shadow-flat">
          <CardContent className="p-6 sm:p-8">
            {/* Meta row */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3 flex-wrap">
              {post.isTop && (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0">
                  <Icon icon="mdi:pin" width={12} className="mr-0.5" />{t('post.pinned')}
                </Badge>
              )}
              {post.isEssence && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                  <Icon icon="mdi:star" width={12} className="mr-0.5" />{t('post.essence')}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                {post.categoryName}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold leading-tight mb-3">
              {post.title}
            </motion.h1>

            {/* Author + stats */}
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {post.author.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{post.author.nickname}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(post.publishedAt)} · {t('post.reads')} {formatCount(post.viewCount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:thumb-up-outline" width={16} />{formatCount(post.likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:comment-outline" width={16} />{formatCount(post.commentCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:bookmark-outline" width={16} />{formatCount(post.collectCount)}
                </span>
              </div>
            </motion.div>

            {/* Tags */}
            {post.tagList.length > 0 && (
              <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5 mb-4">
                {post.tagList.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-primary/5 text-primary/80 font-medium">
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            <Separator className="mb-6" />

            {/* Markdown Content */}
            <motion.article
              ref={articleRef}
              variants={fadeUp}
              className="prose prose-sm sm:prose-base max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-img:rounded-xl prose-li:marker:text-primary"
            >
              <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeHighlight, rehypeKatex]} components={markdownComponents}>
                {post.content}
              </Markdown>
            </motion.article>

            {/* AI Summary */}
            {post.aiSummary && (
              <motion.div variants={fadeUp}>
                <Separator className="my-6" />
                <motion.div
                  className="rounded-xl bg-primary/5 border border-primary/10 p-4"
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon icon="mdi:robot-happy" width={16} className="text-primary" />
                    <span className="text-xs font-bold text-primary">{t('post.aiSummary')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.aiSummary}</p>
                  {post.aiKeywords && post.aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {post.aiKeywords.map((kw) => (
                        <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/8 text-primary/70 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Action bar */}
            <motion.div variants={fadeUp}>
              <Separator className="my-6" />
              <div className="flex items-center justify-center gap-6">
                {[
                  { icon: 'mdi:thumb-up-outline', label: formatCount(post.likeCount), hoverColor: 'hover:text-red-500' },
                  { icon: 'mdi:bookmark-outline', label: formatCount(post.collectCount), hoverColor: 'hover:text-amber-500' },
                  { icon: 'mdi:share-variant-outline', label: t('post.share'), hoverColor: 'hover:text-primary' },
                ].map((btn) => (
                  <motion.button
                    key={btn.icon}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors cursor-pointer',
                      btn.hoverColor,
                    )}
                  >
                    <Icon icon={btn.icon} width={20} />
                    <span>{btn.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TOC Sidebar */}
      {toc.length > 0 && <TableOfContents toc={toc} activeId={activeId} />}
    </div>
  );
}
