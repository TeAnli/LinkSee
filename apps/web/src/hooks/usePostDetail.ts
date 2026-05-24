import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { forumApi } from '@linksee/api-client/forum';
import { extractToc, TocItem } from '@/lib/toc';
import { toast } from 'sonner';

export interface PostDetailData {
  id: number;
  title: string;
  content: string;
  summary: string;
  coverImageUrl: string;
  tagList: string[];
  categoryId: number;
  categoryName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  isTop: boolean;
  isEssence: boolean;
  isLiked: boolean;
  publishedAt: string;
  author: {
    id: number;
    nickname: string;
    avatarUrl: string;
    level: number;
    bio: string;
    postCount: number;
    followerCount: number;
    isFollowed: boolean;
  };
  aiSummary?: string;
  aiKeywords?: string[];
}

export function usePostDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [followed, setFollowed] = useState(false);
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
                ? { ...author, isFollowed: author.isFollowed ?? false }
                : { id: p.authorId, nickname: p.authorNickname, avatarUrl: p.authorAvatarUrl, level: p.authorLevel, bio: '', postCount: 0, followerCount: 0, isFollowed: false },
              aiSummary: detailRes.aiData?.aiSummary,
              aiKeywords: detailRes.aiData?.aiKeywords,
            });
            setLiked(detailRes.isLiked ?? false);
            setCollected(detailRes.isCollected ?? false);
            setFollowed(detailRes.author?.isFollowed ?? false);
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
    const wasLiked = liked;
    setLiked(!wasLiked);
    setPost({ ...post, likeCount: post.likeCount + (wasLiked ? -1 : 1), isLiked: !wasLiked });
    try {
      await forumApi.toggleLike(Number(id));
    } catch {
      setLiked(wasLiked);
      setPost({ ...post, likeCount: post.likeCount, isLiked: wasLiked });
      toast.error('操作失败，请稍后重试');
    }
  }, [id, post, liked]);

  const toggleCollect = useCallback(async () => {
    if (!id || !post) return;
    const wasCollected = collected;
    setCollected(!wasCollected);
    setPost({ ...post, collectCount: post.collectCount + (wasCollected ? -1 : 1) });
    try {
      await forumApi.toggleCollect(Number(id));
    } catch {
      setCollected(wasCollected);
      setPost({ ...post, collectCount: post.collectCount });
      toast.error('操作失败，请稍后重试');
    }
  }, [id, post, collected]);

  const toggleFollow = useCallback(async () => {
    if (!post?.author.id) return;
    const wasFollowed = followed;
    setFollowed(!wasFollowed);
    setPost({
      ...post,
      author: { ...post.author, followerCount: post.author.followerCount + (wasFollowed ? -1 : 1), isFollowed: !wasFollowed },
    });
    try {
      await forumApi.toggleFollow(post.author.id);
    } catch {
      setFollowed(wasFollowed);
      setPost({
        ...post,
        author: { ...post.author, followerCount: post.author.followerCount, isFollowed: wasFollowed },
      });
      toast.error('操作失败，请稍后重试');
    }
  }, [post, followed]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => toast.success('链接已复制到剪贴板'),
      () => toast.error('复制失败'),
    );
  }, []);

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

  return { loading, post, toc, activeId, liked, collected, followed, toggleLike, toggleCollect, toggleFollow, handleShare };
}
