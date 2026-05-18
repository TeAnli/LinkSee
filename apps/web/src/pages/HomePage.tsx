import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PagePlaceholder } from '@/components/layout/PagePlaceholder';
import { PageLoadingSkeleton } from '@/components/skeletons';
import type { PostListItem } from '@linksee/shared';
import { formatRelativeTime, formatCount } from '@/lib/format';
import { fadeUp } from '@/lib/animation';
import { useHomePosts } from '@/hooks/useHomePosts';

function PostCard({ post, index }: { post: PostListItem; index: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <Card
        className="border-[1.5px] rounded-xl shadow-flat transition-all duration-200 hover:shadow-flat-hover hover:border-primary/30 cursor-pointer group"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <CardContent className="p-4">
          {/* Header: tags + badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.isTop && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0">
                <Icon icon="mdi:pin" width={12} className="mr-0.5" />
                {t('post.pinned')}
              </Badge>
            )}
            {post.isEssence && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                <Icon icon="mdi:star" width={12} className="mr-0.5" />
                {t('post.essence')}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              {post.categoryName}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {post.summary}
          </p>

          {/* Tags */}
          {post.tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tagList.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] px-1.5 py-0.5 rounded-md bg-primary/5 text-primary/80 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: author + stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  {post.author.nickname.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground/80">{post.author.nickname}</span>
              <span className="text-muted-foreground/60">{formatRelativeTime(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/60">
              <span className="flex items-center gap-1" title={t('post.views')}>
                <Icon icon="mdi:eye-outline" width={14} />
                {formatCount(post.viewCount)}
              </span>
              <span className="flex items-center gap-1" title={t('post.likes')}>
                <Icon icon="mdi:thumb-up-outline" width={14} />
                {formatCount(post.likeCount)}
              </span>
              <span className="flex items-center gap-1" title={t('post.comments')}>
                <Icon icon="mdi:comment-outline" width={14} />
                {formatCount(post.commentCount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const { posts, loading } = useHomePosts();

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder label={t('nav.home')} icon="mdi:view-grid-outline" />
      {posts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon icon="mdi:file-document-outline" width={48} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t('forum.noResults')}</p>
        </div>
      )}
    </div>
  );
}
