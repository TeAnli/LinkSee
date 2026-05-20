import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi } from '@linksee/api-client/user';
import { formatCount, formatRelativeTime } from '@/lib/format';
import { USER_LEVEL_NAMES, USER_LEVEL_ICONS } from '@linksee/shared';
import { UserLevel } from '@linksee/shared';
import type { UserInfo, PostListItem } from '@linksee/shared';
import { fadeUp, staggerSlow as stagger } from '@/lib/animation';

function StatBlock({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <div className="flex items-center gap-1">
        <Icon icon={icon} width={14} className="text-muted-foreground" />
        <span className="text-sm font-extrabold text-foreground truncate">{value}</span>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function PostItem({ post }: { post: PostListItem }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/post/${post.id}`)}
      className="flex flex-col gap-1.5 text-left w-full p-3 rounded-lg transition-colors duration-150 hover:bg-accent/60 cursor-pointer group"
    >
      <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {post.isTop && <span className="text-destructive mr-1">[置顶]</span>}
        {post.isEssence && <span className="mr-1">[精华]</span>}
        {post.title}
      </h4>
      <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Icon icon="mdi:eye-outline" width={12} />
          {formatCount(post.viewCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <Icon icon="mdi:heart-outline" width={12} />
          {formatCount(post.likeCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <Icon icon="mdi:comment-outline" width={12} />
          {formatCount(post.commentCount)}
        </span>
        <span className="ml-auto flex items-center gap-0.5 opacity-70">
          <Icon icon="mdi:clock-outline" width={12} />
          {formatRelativeTime(post.publishedAt)}
        </span>
      </div>
    </button>
  );
}

export function UserProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userPosts, setUserPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const [profileRes, postsRes] = await Promise.all([
          userApi.getUsersProfile(Number(userId)),
          userApi.getUsersPosts(Number(userId), { page: 1, size: 10 }),
        ]);
        if (!cancelled) {
          setUserInfo(profileRes.data.data);
          const postsData = postsRes.data.data;
          setUserPosts(Array.isArray(postsData) ? postsData : (postsData as { list: PostListItem[] }).list ?? []);
        }
      } catch {
        if (!cancelled) {
          setUserInfo(null);
          setUserPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  const totalLikes = useMemo(() => userPosts.reduce((sum, p) => sum + p.likeCount, 0), [userPosts]);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-[720px] flex flex-col gap-5 pb-8">
          <Card className="overflow-hidden shadow-flat">
            <div className="h-28 bg-muted" />
            <div className="px-5 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                <Skeleton className="size-20 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <div className="grid grid-cols-5 gap-2 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Card className="flex flex-col items-center justify-center w-full max-w-[480px] border-2 border-dashed p-12"
          style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <Icon icon="mdi:account-off-outline" width={56} className="text-muted-foreground opacity-40" />
          <p className="mt-4 text-sm font-bold text-muted-foreground">{t('user.notFound')}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-5 font-bold">
            {t('common.back')}
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex justify-center"
    >
      <div className="w-full max-w-[720px] flex flex-col gap-5 pb-8">
        {/* Profile Card */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden shadow-flat">
            <div className="relative h-28 overflow-hidden">
              <div className="absolute inset-0 opacity-20 pattern-dots" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              }} />
            </div>

            <div className="px-5 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                <Avatar className="size-20 border-[3px] shadow-flat shrink-0" style={{ borderColor: 'var(--card-bg)' }}>
                  {userInfo.avatarUrl ? (
                    <AvatarImage src={userInfo.avatarUrl} alt={userInfo.nickname} />
                  ) : null}
                  <AvatarFallback className="text-xl font-extrabold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {userInfo.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-extrabold leading-tight flex items-center gap-1.5">
                      {userInfo.nickname}
                      <span className="text-sm">{USER_LEVEL_ICONS[userInfo.level as UserLevel]}</span>
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground">@{userInfo.username}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground/60">
                      {USER_LEVEL_NAMES[userInfo.level as UserLevel]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold shrink-0"
                      onClick={() => navigate(`/messages/dm/${userId}`)}
                    >
                      <Icon icon="mdi:message-outline" width={14} className="mr-1.5" />
                      {t('user.sendMessage')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold shrink-0"
                      onClick={() => navigate(-1)}
                    >
                      <Icon icon="mdi:arrow-left" width={14} className="mr-1.5" />
                      {t('common.back')}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                <StatBlock icon="mdi:file-document-outline" value={String(userPosts.length)} label={t('profile.postsCount')} />
                <StatBlock icon="mdi:heart-outline" value={formatCount(totalLikes)} label={t('profile.likesReceived')} />
                <button
                  type="button"
                  onClick={() => navigate('/friends')}
                  className="flex flex-col items-center gap-0.5 min-w-0 rounded-lg p-1.5 -m-1 transition-colors hover:bg-muted/60 cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <Icon icon="mdi:account-plus-outline" width={14} className="text-muted-foreground" />
                    <span className="text-sm font-extrabold text-foreground truncate">—</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{t('profile.followers')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/friends')}
                  className="flex flex-col items-center gap-0.5 min-w-0 rounded-lg p-1.5 -m-1 transition-colors hover:bg-muted/60 cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <Icon icon="mdi:account-arrow-right-outline" width={14} className="text-muted-foreground" />
                    <span className="text-sm font-extrabold text-foreground truncate">—</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{t('profile.following')}</span>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Posts */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-flat overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t('profile.recentPosts')}
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground">{userPosts.length}</span>
            </div>
            <Separator />
            {userPosts.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--muted)' }}>
                {userPosts.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Icon icon="mdi:file-edit-outline" width={36} className="text-muted-foreground opacity-30" />
                <p className="text-xs font-medium text-muted-foreground italic">{t('profile.noPostsYet')}</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
