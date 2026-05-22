import { useState, useEffect } from 'react';
import { useForumStore } from '@/stores/useForumStore';
import { PostListItem, Category } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';

export function useForumCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await forumApi.listCategories();
        if (!cancelled) {
          const raw = res.data.data;
          setCategories(Array.isArray(raw) ? raw : []);
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading };
}

export function useForumPosts() {
  const { activeCategory, sortType, keyword, page, pageSize } = useForumStore();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const sortMap: Record<string, string> = {
      latest: 'latest',
      hottest: 'hot',
      essence: 'essence',
    };
    const fetchData = async () => {
      try {
        const res = await forumApi.listPosts({
          categoryId: activeCategory ?? undefined,
          sort: sortMap[sortType] as 'hot' | 'latest' | 'featured',
          keyword: keyword.trim() || undefined,
          page,
          size: pageSize,
        });
        if (!cancelled) {
          const data = res.data.data;
          setPosts(Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : []));
          setTotal(data?.total ?? 0);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [activeCategory, sortType, keyword, page, pageSize]);

  return { posts, total, loading, pageSize };
}
