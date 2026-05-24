import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeTime, formatCount } from '@/lib/format';
import { PostListItem } from '@linksee/shared';

interface ForumPostCardProps {
  post: PostListItem;
  index: number;
}

export const ForumPostCard = memo(function ForumPostCard({ post, index }: ForumPostCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Link to={`/post/${post.id}`}>
        <Card className="group p-4 hover:border-primary/30 hover:shadow-flat-hover transition-all duration-200 cursor-pointer">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 shrink-0 mt-0.5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {post.author.nickname.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {post.isTop && (
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] gap-0.5">
                    <Icon icon="mdi:pin" className="h-2.5 w-2.5" />
                    {t('post.pinned')}
                  </Badge>
                )}
                {post.isEssence && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-0.5">
                    <Icon icon="mdi:sparkles" className="h-2.5 w-2.5" />
                    {t('post.essence')}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px]">
                  {post.categoryName}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>

              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {post.summary}
              </p>

              {post.tagList.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {post.tagList.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded-md bg-muted/60 text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {post.author.nickname}
                  </span>
                  <span>·</span>
                  <span>{formatRelativeTime(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1" title={t('post.views')}>
                    <Icon icon="mdi:eye-outline" className="h-3 w-3" />
                    {formatCount(post.viewCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('post.likes')}>
                    <Icon icon="mdi:heart-outline" className="h-3 w-3" />
                    {formatCount(post.likeCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('post.comments')}>
                    <Icon icon="mdi:message-outline" className="h-3 w-3" />
                    {formatCount(post.commentCount)}
                  </span>
                  <span className="flex items-center gap-1" title={t('profile.collectedCount')}>
                    <Icon icon="mdi:bookmark-outline" className="h-3 w-3" />
                    {formatCount(post.collectCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});
