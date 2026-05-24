import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PostDetailSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatCount } from '@/lib/format';
import { TableOfContents, PostMarkdown } from '@/components/post';
import { CommentInput, CommentList } from '@/components/comment';
import { usePostDetail, useComments } from '@/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import { TOPBAR_HEIGHT } from '@/components/layout/Sidebar';
import { forumApi } from '@linksee/api-client/forum';
import type { PostListItem } from '@linksee/shared';
import { useEffect, useState } from 'react';
import { fadeUp, stagger } from '@/lib/animation';

const authorCardWidth = 240;

function AuthorSidebar({ post, followed, onToggleFollow, onNavigate }: {
  post: NonNullable<ReturnType<typeof usePostDetail>['post']>;
  followed: boolean;
  onToggleFollow: () => void;
  onNavigate: (userId: number) => void;
}) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [relatedPosts, setRelatedPosts] = useState<Pick<PostListItem, 'id' | 'title'>[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRelatedLoading(true);
    forumApi.listPosts({ categoryId: post.categoryId, sort: 'hot', size: 5 })
      .then((res) => {
        if (!cancelled) {
          const data: any = res.data.data;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          setRelatedPosts(list.filter((p: any) => p.id !== post.id).slice(0, 5));
          setRelatedLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setRelatedLoading(false); });
    return () => { cancelled = true; };
  }, [post.categoryId, post.id]);

  return (
    <aside
      className="hidden lg:flex flex-col fixed right-0 border-l-[1.5px] border-border bg-background"
      style={{ top: `${TOPBAR_HEIGHT}px`, bottom: 0, width: `${authorCardWidth}px` }}
    >
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {/* Author card */}
          <Card className="border-[1.5px]">
            <CardHeader className="pb-3 text-center">
              <button
                type="button"
                onClick={() => onNavigate(post.author.id)}
                className="flex flex-col items-center gap-2 w-full cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Avatar className="size-14 ring-2 ring-border/50">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                    {post.author.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-extrabold text-foreground">{post.author.nickname}</p>
                  <p className="text-[11px] text-muted-foreground">Lv.{post.author.level}</p>
                </div>
              </button>
              {post.author.bio && (
                <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{post.author.bio}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-around text-center mb-3">
                <div>
                  <p className="text-sm font-extrabold">{formatCount(post.author.postCount)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('profile.posts')}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm font-extrabold">{formatCount(post.author.followerCount)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('profile.followers')}</p>
                </div>
              </div>
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant={followed ? 'outline' : 'default'}
                  className="w-full text-xs"
                  onClick={onToggleFollow}
                >
                  <Icon icon={followed ? 'mdi:account-check' : 'mdi:account-plus'} width={14} className="mr-1" />
                  {followed ? t('profile.following') : t('profile.follow')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Related posts */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Icon icon="mdi:file-document-multiple-outline" width={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">{t('post.relatedPosts')}</span>
            </div>
            {relatedLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {relatedPosts.map((rp, i) => (
                  <a
                    key={rp.id}
                    href={`/post/${rp.id}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5 py-1"
                  >
                    <span className="text-[10px] font-bold text-primary/50 w-3 shrink-0">{i + 1}</span>
                    {rp.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

export function PostDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading, post, toc, activeId, liked, collected, followed, toggleLike, toggleCollect, toggleFollow, handleShare } = usePostDetail();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { comments, loading: commentsLoading, hasMore, submitting, sortBy, changeSortBy, replyTo, setReplyTo, loadMore, addComment } = useComments(post?.id ?? 0);

  const handleNavigateUser = useCallback((userId: number) => {
    navigate(`/user/${userId}`);
  }, [navigate]);

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Icon icon="mdi:file-search-outline" width={64} className="text-muted-foreground/40" />
        <p className="text-lg font-bold text-muted-foreground">{t('post.postNotFound')}</p>
        <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline cursor-pointer">
          {t('post.backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:mr-[240px]">
      <motion.div className="flex flex-col gap-4" initial="hidden" animate="visible" variants={stagger}>
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer group"
        >
          <Icon icon="mdi:arrow-left" width={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('common.back')}</span>
        </motion.button>

        <Card className="border-[1.5px] rounded-xl shadow-flat">
          <CardContent className="p-6 sm:p-8">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3 flex-wrap">
              {post.isTop && (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0">
                  <Icon icon="mdi:pin" width={12} className="mr-0.5" />{t('post.pinned')}
                </Badge>
              )}
              {post.isEssence && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                  <Icon icon="mdi:star" width={12} className="mr-0.5" />{t('post.essence')}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                {post.categoryName}
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold leading-tight mb-3">
              {post.title}
            </motion.h1>

            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(`/user/${post.author.id}`)}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {post.author.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold">{post.author.nickname}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(post.publishedAt)} · {t('post.reads')} {formatCount(post.viewCount)}
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1 cursor-pointer transition-colors hover:text-red-500"
                >
                  <Icon icon={liked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'} width={16} className={liked ? 'text-red-500' : ''} />
                  {formatCount(post.likeCount)}
                </button>
                <span className="flex items-center gap-1"><Icon icon="mdi:comment-outline" width={16} />{formatCount(post.commentCount)}</span>
                <button
                  onClick={toggleCollect}
                  className="flex items-center gap-1 cursor-pointer transition-colors hover:text-amber-500"
                >
                  <Icon icon={collected ? 'mdi:bookmark' : 'mdi:bookmark-outline'} width={16} className={collected ? 'text-amber-500' : ''} />
                  {formatCount(post.collectCount)}
                </button>
              </div>
            </motion.div>

            {post.tagList.length > 0 && (
              <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5 mb-4">
                {post.tagList.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-primary/5 text-primary/80 font-medium">
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            <Separator className="mb-6" />

            <motion.article
              variants={fadeUp}
              className="prose prose-sm sm:prose-base max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-img:rounded-xl prose-li:marker:text-primary"
            >
              <PostMarkdown content={post.content} />
            </motion.article>

            {post.aiSummary && (
              <motion.div variants={fadeUp}>
                <Separator className="my-6" />
                <motion.div
                  className="rounded-xl bg-primary/5 border border-primary/10 p-4"
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon icon="mdi:robot-happy" width={16} className="text-primary" />
                    <span className="text-xs font-bold text-primary">{t('post.aiSummary')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.aiSummary}</p>
                  {post.aiKeywords && post.aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {post.aiKeywords.map((kw) => (
                        <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/8 text-primary/70 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div variants={fadeUp}>
              <Separator className="my-6" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Icon icon="mdi:comment-text-multiple-outline" width={18} />
                  {t('post.comments')} ({comments.length > 0 ? comments.length : post.commentCount})
                </h3>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => changeSortBy('latest')}
                    className={cn(
                      'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                      sortBy === 'latest' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t('comment.newest')}
                  </button>
                  <button
                    onClick={() => changeSortBy('popular')}
                    className={cn(
                      'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                      sortBy === 'popular' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t('comment.hottest')}
                  </button>
                </div>
              </div>
              <CommentInput
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSubmit={addComment}
                submitting={submitting}
                disabled={!isAuthenticated}
              />
              <div className="mt-4">
                <CommentList
                  comments={comments}
                  loading={commentsLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onReply={(commentId, userId, nickname) => setReplyTo({ commentId, userId, nickname })}
                  postAuthorId={post.author.id}
                />
              </div>
            </motion.div>

            {/* Bottom action bar */}
            <motion.div variants={fadeUp}>
              <Separator className="my-6" />
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  onClick={toggleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-colors cursor-pointer',
                    liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500',
                  )}
                >
                  <Icon icon={liked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'} width={20} />
                  <span>{formatCount(post.likeCount)}</span>
                </motion.button>
                <motion.button
                  onClick={toggleCollect}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-colors cursor-pointer',
                    collected ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500',
                  )}
                >
                  <Icon icon={collected ? 'mdi:bookmark' : 'mdi:bookmark-outline'} width={20} />
                  <span>{formatCount(post.collectCount)}</span>
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors cursor-pointer hover:text-primary"
                >
                  <Icon icon="mdi:share-variant-outline" width={20} />
                  <span>{t('post.share')}</span>
                </motion.button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {toc.length > 0 && <TableOfContents toc={toc} activeId={activeId} />}

      {post && (
        <AuthorSidebar
          post={post}
          followed={followed}
          onToggleFollow={toggleFollow}
          onNavigate={handleNavigateUser}
        />
      )}
    </div>
  );
}
