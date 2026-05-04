import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Pin,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Pagination } from '@/components/ui/pagination';
import {
  mockCategories,
  mockPosts,
  formatRelativeTime,
  formatCount,
} from '@/mock/data';

type SortType = 'latest' | 'hottest' | 'essence';
const PAGE_SIZE = 5;

export function ForumPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sortType, setSortType] = useState<SortType>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts];

    // Filter by category (including children)
    if (activeCategory !== null) {
      const category = mockCategories.find((c) => c.id === activeCategory);
      if (category) {
        const categoryIds = [
          category.id,
          ...(category.children?.map((c) => c.id) ?? []),
        ];
        posts = posts.filter((p) => categoryIds.includes(p.categoryId));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tagList.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortType) {
      case 'hottest':
        posts.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'essence':
        posts = posts.filter((p) => p.isEssence);
        break;
      default: // latest
        posts.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }

    // Pinned posts always on top
    const pinned = posts.filter((p) => p.isTop);
    const normal = posts.filter((p) => !p.isTop);
    return [...pinned, ...normal];
  }, [activeCategory, sortType, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleCategoryChange = (categoryId: number | null) => {
    setActiveCategory(categoryId);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortType(value as SortType);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Category Tabs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <CategoryPill
            name={t('forum.allCategories')}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            color="#6366F1"
            active={activeCategory === null}
            count={mockPosts.length}
            onClick={() => handleCategoryChange(null)}
          />
          {mockCategories.map((cat) => (
            <CategoryPill
              key={cat.id}
              name={cat.name}
              icon={
                <Icon
                  icon={cat.icon}
                  className="h-3.5 w-3.5"
                />
              }
              color={cat.themeColor}
              active={activeCategory === cat.id}
              count={cat.postCount}
              onClick={() => handleCategoryChange(cat.id)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Search & Sort Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('forum.searchPosts')}
            className="pl-9 h-9"
          />
        </div>
        <Tabs value={sortType} onValueChange={handleSortChange}>
          <TabsList className="h-9">
            <TabsTrigger value="latest" className="text-xs px-3">
              <Clock className="h-3 w-3 mr-1" />
              {t('forum.latest')}
            </TabsTrigger>
            <TabsTrigger value="hottest" className="text-xs px-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              {t('forum.hottest')}
            </TabsTrigger>
            <TabsTrigger value="essence" className="text-xs px-3">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('forum.essence')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-xs text-muted-foreground ml-auto">
          {t('forum.totalPosts', { count: filteredPosts.length })}
        </span>
      </div>

      {/* Post List */}
      <AnimatePresence mode="wait">
        {paginatedPosts.length > 0 ? (
          <motion.div
            key={`${activeCategory}-${sortType}-${page}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {paginatedPosts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t('forum.noResults')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('forum.noResultsDesc')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            page={page}
            total={filteredPosts.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// === Category Pill ===

function CategoryPill({
  name,
  icon,
  color,
  active,
  count,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-[1.5px] transition-all duration-200 shrink-0',
        active
          ? 'border-transparent text-white shadow-flat'
          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
      )}
      style={
        active
          ? {
              backgroundColor: color,
              boxShadow: `2px 2px 0px 0px ${color}88`,
            }
          : undefined
      }
    >
      {icon}
      <span>{name}</span>
      <span
        className={cn(
          'text-[10px] ml-0.5',
          active ? 'text-white/80' : 'text-muted-foreground'
        )}
      >
        {formatCount(count)}
      </span>
    </button>
  );
}

// === Post Card ===

function PostCard({
  post,
  index,
}: {
  post: (typeof mockPosts)[number];
  index: number;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Link to={`/post/${post.id}`}>
        <Card className="group p-4 hover:border-primary/30 hover:shadow-flat-hover transition-all duration-200 cursor-pointer">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar className="h-9 w-9 shrink-0 mt-0.5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {post.author.nickname.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badges Row */}
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {post.isTop && (
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] gap-0.5">
                    <Pin className="h-2.5 w-2.5" />
                    {t('post.pinned')}
                  </Badge>
                )}
                {post.isEssence && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t('post.essence')}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px]">
                  {post.categoryName}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {post.summary}
              </p>

              {/* Tags */}
              {post.tagList.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {post.tagList.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded-md bg-muted/60 text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer: Author + Stats */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {post.author.nickname}
                  </span>
                  <span>·</span>
                  <span>{formatRelativeTime(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1" title={t('post.views')}>
                    <Eye className="h-3 w-3" />
                    {formatCount(post.viewCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('post.likes')}>
                    <Heart className="h-3 w-3" />
                    {formatCount(post.likeCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('post.comments')}>
                    <MessageSquare className="h-3 w-3" />
                    {formatCount(post.commentCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('profile.collectedCount')}>
                    <Bookmark className="h-3 w-3" />
                    {formatCount(post.collectCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
