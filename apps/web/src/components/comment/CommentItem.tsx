import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatCount } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CommentItem as CommentItemType } from '@linksee/shared';

interface CommentItemProps {
  comment: CommentItemType;
  onReply: (commentId: number, userId: number, nickname: string) => void;
  depth?: number;
  postAuthorId?: number;
}

const DEPTH_BORDER = [
  '',                                          // depth 0: no left border
  'border-l-[3px] border-primary/40',          // depth 1: primary tint
  'border-l-[3px] border-border',              // depth 2+: muted
];

export function CommentItem({ comment, onReply, depth = 0, postAuthorId }: CommentItemProps) {
  const { t } = useTranslation();
  const [showChildren, setShowChildren] = useState(depth < 2);
  const authorName = comment.author?.nickname || t('post.anonymous');
  const authorInitial = authorName.slice(0, 1);
  const isPostAuthor = postAuthorId != null && comment.author?.id === postAuthorId;
  const borderClass = DEPTH_BORDER[Math.min(depth, 2)];

  return (
    <div className={cn('flex flex-col', depth === 0 && 'group')}>
      {/* Comment body */}
      <div
        className={cn(
          'flex gap-2.5 py-3 px-3 rounded-lg transition-colors',
          depth === 0 && 'hover:bg-muted/20',
          depth > 0 && borderClass,
          depth === 0 && 'bg-card/40',
        )}
      >
        <Avatar className="size-8 shrink-0 ring-2 ring-border/50">
          <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
            {authorInitial}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header: name + badges + time */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[13px] font-extrabold text-foreground">{authorName}</span>
            {isPostAuthor && (
              <Badge
                variant="default"
                className="text-[10px] px-1.5 py-0 rounded-sm font-bold leading-tight"
              >
                {t('forum.author')}
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground/70 ml-auto">
              {formatRelativeTime(comment.createdAt ?? '')}
            </span>
          </div>

          {/* Reply-to indicator */}
          {comment.replyTo && (
            <div className="inline-flex items-center gap-1 text-[11px] text-primary bg-primary/5 border border-primary/10 rounded-md px-2 py-0.5 mb-1.5">
              <Icon icon="mdi:reply" width={12} />
              <span>{t('post.replyToSomeone', { name: comment.replyTo.nickname })}</span>
            </div>
          )}

          {/* Content */}
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onReply(comment.id, comment.author?.id ?? 0, authorName)}
              className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
            >
              <Icon icon="mdi:reply-outline" width={14} />
              <span>{t('post.replyTo')}</span>
            </button>
            {comment.likeCount > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Icon icon="mdi:thumb-up-outline" width={12} />
                {formatCount(comment.likeCount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nested children */}
      {comment.children && comment.children.length > 0 && (
        <div className={cn('ml-4', depth === 0 && 'ml-6')}>
          {/* Collapse toggle for deep nesting */}
          {depth >= 2 && (
            <button
              onClick={() => setShowChildren(!showChildren)}
              className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1.5 font-medium"
            >
              <Icon
                icon={showChildren ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                width={14}
                className="inline"
              />
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
                  <CommentItem
                    comment={child}
                    onReply={onReply}
                    depth={depth + 1}
                    postAuthorId={postAuthorId}
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
