import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatCount } from '@/lib/format';
import type { CommentItem as CommentItemType } from '@linksee/shared';

interface CommentItemProps {
  comment: CommentItemType;
  onReply: (commentId: number, userId: number, nickname: string) => void;
  depth?: number;
  postAuthorId?: number;
}

export function CommentItem({ comment, onReply, depth = 0, postAuthorId }: CommentItemProps) {
  const { t } = useTranslation();
  const [showChildren, setShowChildren] = useState(depth < 2);
  const authorName = comment.author?.nickname ?? '?';
  const authorInitial = authorName.slice(0, 1);
  const isPostAuthor = postAuthorId != null && comment.author?.id === postAuthorId;

  return (
    <div className="flex flex-col">
      <div className="flex gap-2.5 py-3">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
            {authorInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-foreground">{authorName}</span>
            {isPostAuthor && (
              <Badge variant="default" className="text-[9px] px-1 py-0 rounded-sm leading-none">
                {t('forum.author')}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt ?? '')}
            </span>
          </div>
          {comment.replyTo && (
            <div className="text-[11px] text-muted-foreground mb-1">
              <Icon icon="mdi:reply" width={12} className="inline mr-0.5" />
              {t('post.replyToSomeone', { name: comment.replyTo.nickname })}
            </div>
          )}
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onReply(comment.id, comment.author?.id ?? 0, authorName)}
              className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Icon icon="mdi:reply-outline" width={14} />
              <span>{t('post.replyTo')}</span>
            </button>
            {comment.likeCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Icon icon="mdi:thumb-up-outline" width={12} />
                {formatCount(comment.likeCount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nested children */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-6 border-l-2 border-border pl-4">
          {depth >= 2 && (
            <button
              onClick={() => setShowChildren(!showChildren)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
            >
              <Icon icon={showChildren ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={14} className="inline mr-0.5" />
              {showChildren
                ? t('post.collapseReplies')
                : t('post.expandReplies', { count: comment.childCount })}
            </button>
          )}
          <AnimatePresence>
            {showChildren &&
              comment.children.map((child) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CommentItem comment={child} onReply={onReply} depth={depth + 1} postAuthorId={postAuthorId} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
