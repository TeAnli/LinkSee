import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';
import { CommentItem } from './CommentItem';
import type { CommentItem as CommentItemType } from '@linksee/shared';

interface CommentListProps {
  comments: CommentItemType[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReply: (commentId: number, userId: number, nickname: string) => void;
  postAuthorId?: number;
}

export function CommentList({ comments, loading, hasMore, onLoadMore, onReply, postAuthorId }: CommentListProps) {
  const { t } = useTranslation();

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <Icon icon="mdi:loading" width={22} className="animate-spin text-primary/60" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/50">
        <Icon icon="mdi:comment-text-outline" width={44} />
        <span className="text-sm font-medium">{t('post.noComments')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          {index > 0 && <Separator className="my-1" />}
          <CommentItem comment={comment} onReply={onReply} postAuthorId={postAuthorId} />
        </div>
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
        >
          <Icon icon="mdi:chevron-down" width={16} />
          {t('post.commentLoadMore')}
        </button>
      )}
    </div>
  );
}
