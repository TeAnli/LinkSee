import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Pagination } from '@/components/ui/pagination';
import { ForumCategoryList, ForumSearchBar, ForumPostCard } from '@/components/forum';
import { useForumCategories, useForumPosts } from '@/hooks';
import { useForumStore } from '@/stores';

export function ForumPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useForumCategories();
  const { posts, total, loading, pageSize } = useForumPosts();
  const {
    activeCategory,
    sortType,
    keyword,
    page,
    setActiveCategory,
    setSortType,
    setKeyword,
    setPage,
  } = useForumStore();

  // 从 URL 读取初始搜索关键词
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const q = searchParams.get('keyword');
    if (q) setKeyword(q);
  }, [searchParams, setKeyword]);

  // 搜索词变化时同步到 URL
  useEffect(() => {
    if (!initRef.current) return;
    const params = new URLSearchParams(searchParams);
    if (keyword) {
      params.set('keyword', keyword);
    } else {
      params.delete('keyword');
    }
    setSearchParams(params, { replace: true });
  }, [keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(total / pageSize);

  const handleSortChange = useCallback((value: string) => {
    setSortType(value as 'latest' | 'hottest' | 'essence');
  }, [setSortType]);

  return (
    <div className="flex flex-col gap-5">
      <ScrollArea className="w-full whitespace-nowrap">
        <ForumCategoryList
          categories={categories}
          activeCategory={activeCategory}
          totalPosts={total}
          onCategoryChange={setActiveCategory}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <ForumSearchBar
        searchQuery={keyword}
        onSearchChange={setKeyword}
        sortType={sortType}
        onSortChange={handleSortChange}
        totalPosts={total}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon icon="mdi:loading" width={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : posts.length > 0 ? (
          <motion.div
            key={`${activeCategory}-${sortType}-${page}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {posts.map((post, idx) => (
              <ForumPostCard key={post.id} post={post} index={idx} />
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
              <Icon icon="mdi:magnify" className="h-6 w-6 text-muted-foreground" />
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

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
