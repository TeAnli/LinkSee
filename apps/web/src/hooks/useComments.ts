import { useState, useEffect, useCallback } from 'react';
import type { CommentItem } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';
import { toast } from 'sonner';

export type CommentSortBy = 'latest' | 'oldest' | 'popular';

function flattenComments(comments: CommentItem[]): CommentItem[] {
  const result: CommentItem[] = [];
  for (const c of comments) {
    result.push(c);
    if (c.children?.length) {
      result.push(...flattenComments(c.children));
    }
  }
  return result;
}

export function useComments(postId: number) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSortBy>('latest');
  const [replyTo, setReplyTo] = useState<{ commentId: number; userId: number; nickname: string } | null>(null);

  const fetchComments = useCallback(async (page = 1, sort: CommentSortBy = sortBy) => {
    setLoading(page === 1);
    try {
      const res = await forumApi.getComments(postId, { sortBy: sort, page, size: 10 });
      const data: any = res.data.data;
      if (page === 1) {
        setComments((data?.list as CommentItem[]) ?? []);
      } else {
        setComments((prev) => [...prev, ...((data?.list as CommentItem[]) ?? [])]);
      }
      setHasMore(data?.hasMore ?? false);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [postId, sortBy]);

  useEffect(() => {
    if (!postId) return;
    fetchComments(1, sortBy);
  }, [postId, sortBy, fetchComments]);

  const changeSortBy = useCallback((sort: CommentSortBy) => {
    setSortBy(sort);
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = Math.floor(flattenComments(comments).length / 10) + 1;
    try {
      const res = await forumApi.getComments(postId, { sortBy, page: nextPage, size: 10 });
      const data: any = res.data.data;
      setComments((prev) => [...prev, ...((data?.list as CommentItem[]) ?? [])]);
      setHasMore(data?.hasMore ?? false);
    } catch {
      // silent fail
    }
  }, [postId, comments, sortBy]);

  const addComment = useCallback(async (content: string) => {
    const parentId = replyTo?.commentId;
    const replyUserId = replyTo?.userId;
    setSubmitting(true);
    const optimistic: CommentItem = {
      id: -Date.now(),
      content,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      author: { id: 0, nickname: '...', avatarUrl: '', level: 1, bio: '', postCount: 0, followerCount: 0, isFollowed: false },
      replyTo: replyTo ? { userId: replyTo.userId, nickname: replyTo.nickname } : null,
      childCount: 0,
      children: [],
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, children: [...c.children, optimistic], childCount: c.childCount + 1 } : c)),
      );
    } else {
      setComments((prev) => [optimistic, ...prev]);
    }
    setReplyTo(null);

    try {
      await forumApi.createComment(postId, { content, parentId, replyUserId });
      await fetchComments(1, sortBy);
    } catch {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => (c.id === parentId ? { ...c, children: c.children.filter((ch) => ch.id !== optimistic.id), childCount: c.childCount - 1 } : c)),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      }
      toast.error('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [postId, replyTo, sortBy, fetchComments]);

  return { comments, loading, hasMore, submitting, sortBy, changeSortBy, replyTo, setReplyTo, loadMore, addComment };
}
