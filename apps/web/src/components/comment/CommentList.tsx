import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { CommentItem } from './CommentItem';
import type { CommentItem as CommentItemType } from '@linksee/shared';

interface CommentListProps {
  comments: CommentItemType[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReply: (commentId: number, userId: number, nickname: string) => void;
}

export function CommentList({ comments, loading, hasMore, onLoadMore, onReply }: CommentListProps) {
  const { t } = useTranslation();

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon icon="mdi:loading" width={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground/40">
        <Icon icon="mdi:comment-text-outline" width={40} />
        <span className="text-sm">{t('post.noComments')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} />
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Icon icon="mdi:chevron-down" width={14} />
          {t('post.commentLoadMore')}
        </button>
      )}
    </div>
  );
}
