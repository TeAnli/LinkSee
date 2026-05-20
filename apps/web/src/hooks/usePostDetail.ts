import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PostDetail } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';
import { extractToc, TocItem } from '@/lib/toc';
import { toast } from 'sonner';

export function usePostDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const toc: TocItem[] = post ? extractToc(post.content) : [];

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await forumApi.getPostDetail(Number(id));
        if (!cancelled) {
          const detailRes: any = res.data.data;
          if (detailRes?.post) {
            const p = detailRes.post;
            const author = detailRes.author;
            setPost({
              id: p.id,
              title: p.title,
              content: p.content,
              summary: p.summary,
              coverImageUrl: p.coverImageUrl,
              tagList: p.tagList,
              categoryId: p.categoryId,
              categoryName: p.categoryName,
              viewCount: p.viewCount,
              likeCount: p.likeCount,
              commentCount: p.commentCount,
              collectCount: p.collectCount,
              isTop: p.isTop,
              isEssence: p.isEssence,
              isLiked: detailRes.isLiked ?? false,
              publishedAt: p.publishedAt ?? '',
              author: author
                ? { id: author.id, nickname: author.nickname, avatarUrl: author.avatarUrl, level: author.level }
                : { id: p.authorId, nickname: p.authorNickname, avatarUrl: p.authorAvatarUrl, level: p.authorLevel },
              aiSummary: detailRes.aiData?.aiSummary,
              aiKeywords: detailRes.aiData?.aiKeywords,
            });
            setLiked(detailRes.isLiked ?? false);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const toggleLike = useCallback(async () => {
    if (!id || !post) return;
    const postId = Number(id);
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setPost({
      ...post,
      likeCount: post.likeCount + (wasLiked ? -1 : 1),
      isLiked: !wasLiked,
    });
    try {
      await forumApi.toggleLike(postId);
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setPost({
        ...post,
        likeCount: post.likeCount,
        isLiked: wasLiked,
      });
      toast.error('操作失败，请稍后重试');
    }
  }, [id, post, liked]);

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

  return { loading, post, toc, activeId, liked, toggleLike };
}
