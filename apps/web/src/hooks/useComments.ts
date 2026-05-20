import { useState, useEffect, useCallback } from 'react';
import type { CommentItem } from '@linksee/shared';
import { forumApi } from '@linksee/api-client/forum';
import { toast } from 'sonner';

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
  // replyTo: { commentId, userId, nickname } | null
  const [replyTo, setReplyTo] = useState<{ commentId: number; userId: number; nickname: string } | null>(null);

  const fetchComments = useCallback(async (page = 1) => {
    setLoading(page === 1);
    try {
      const res = await forumApi.getComments(postId, { sortBy: 'latest', page, size: 10, rootOnly: true });
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
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId, fetchComments]);

  const loadMore = useCallback(async () => {
    const nextPage = Math.floor(flattenComments(comments).length / 10) + 1;
    try {
      const res = await forumApi.getComments(postId, { sortBy: 'latest', page: nextPage, size: 10, rootOnly: true });
      const data: any = res.data.data;
      setComments((prev) => [...prev, ...((data?.list as CommentItem[]) ?? [])]);
      setHasMore(data?.hasMore ?? false);
    } catch {
      // silent fail
    }
  }, [postId, comments]);

  const addComment = useCallback(async (content: string) => {
    const parentId = replyTo?.commentId;
    const replyUserId = replyTo?.userId;
    setSubmitting(true);
    // Build optimistic comment
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
      // Insert as child of parent comment
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, children: [...c.children, optimistic], childCount: c.childCount + 1 } : c)),
      );
    } else {
      setComments((prev) => [optimistic, ...prev]);
    }
    setReplyTo(null);

    try {
      await forumApi.createComment(postId, { content, parentId, replyUserId });
      // Refetch to get real data
      await fetchComments();
    } catch {
      // Rollback
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
  }, [postId, replyTo, fetchComments]);

  return { comments, loading, hasMore, submitting, replyTo, setReplyTo, loadMore, addComment };
}
