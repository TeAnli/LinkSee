import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from '@/components/avatar/AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileSkeleton } from '@/components/skeletons';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import { formatCount, formatRelativeTime } from '@/lib/format';
import { USER_LEVEL_NAMES, USER_LEVEL_ICONS, USER_LEVEL_EXP } from '@linksee/shared';
import { UserLevel } from '@linksee/shared';
import type { UserProfileResponse, PostListItem } from '@linksee/shared';
import { cn } from '@/lib/utils';
import { fadeUp, staggerSlow as stagger } from '@/lib/animation';

/* ── Social Icon Map ── */

const socialIconMap: Record<string, string> = {
  github: 'mdi:github',
  twitter: 'mdi:twitter',
  x: 'mdi:twitter',
  linkedin: 'mdi:linkedin',
  website: 'mdi:web',
  blog: 'mdi:post-outline',
  juejin: 'mdi:card-text-outline',
  zhihu: 'mdi:message-text-outline',
  bilibili: 'mdi:television-play',
  weibo: 'mdi:chat-outline',
  telegram: 'mdi:telegram',
  discord: 'mdi:discord',
};

/* ── Components ── */

function StatBlock({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <div className="flex items-center gap-1">
        <Icon icon={icon} width={14} height={14} className="text-muted-foreground" />
        <span className="text-sm font-extrabold text-foreground truncate">{value}</span>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function LevelProgressBar({ experience, level }: { experience: number; level: number }) {
  const { t } = useTranslation();
  const levels = [UserLevel.NEWBIE, UserLevel.ACTIVE, UserLevel.EXPERT, UserLevel.PROFESSIONAL, UserLevel.STAR, UserLevel.LEADER];
  const idx = levels.indexOf(level as UserLevel);
  const currentExp = USER_LEVEL_EXP[level as UserLevel] ?? 0;
  const nextLevel = idx < levels.length - 1 ? levels[idx + 1] : null;
  const nextExp = nextLevel ? USER_LEVEL_EXP[nextLevel] : currentExp;
  const progress = nextLevel ? Math.min(((experience - currentExp) / (nextExp - currentExp)) * 100, 100) : 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1 text-xs font-bold">
          <span>{USER_LEVEL_ICONS[level as UserLevel]}</span>
          <span>{USER_LEVEL_NAMES[level as UserLevel]}</span>
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {nextLevel ? `${experience} / ${nextExp} ${t('profile.experiencePoints')}` : 'MAX'}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function SkillTag({ name }: { name: string }) {
  return (
    <Badge
      variant="secondary"
      className="text-xs font-semibold px-2.5 py-0.5 rounded-md cursor-default select-none"
    >
      {name}
    </Badge>
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
          <Icon icon="mdi:eye-outline" width={12} height={12} />
          {formatCount(post.viewCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <Icon icon="mdi:heart-outline" width={12} height={12} />
          {formatCount(post.likeCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <Icon icon="mdi:comment-outline" width={12} height={12} />
          {formatCount(post.commentCount)}
        </span>
        <span className="ml-auto flex items-center gap-0.5 opacity-70">
          <Icon icon="mdi:clock-outline" width={12} height={12} />
          {formatRelativeTime(post.publishedAt)}
        </span>
      </div>
    </button>
  );
}

/* ── Main Page ── */

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [userPosts, setUserPosts] = useState<PostListItem[]>([]);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const [profileRes, postsRes] = await Promise.all([
          userApi.getProfile(),
          userApi.getUsersPosts(user!.id, { page: 1, size: 10 }),
        ]);
        if (!cancelled) {
          setProfileData(profileRes.data.data);
          const postsData = postsRes.data.data;
          setUserPosts(Array.isArray(postsData) ? postsData : (postsData as { list: PostListItem[] }).list ?? []);
        }
      } catch {
        if (!cancelled) {
          setProfileData(null);
          setUserPosts([]);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (profileData || !isAuthenticated) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [profileData, isAuthenticated]);

  const totalLikes = useMemo(
    () => userPosts.reduce((sum, p) => sum + p.likeCount, 0),
    [userPosts],
  );
  const totalCollects = useMemo(
    () => userPosts.reduce((sum, p) => sum + p.collectCount, 0),
    [userPosts],
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  /* Not logged in */
  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <Card className="flex flex-col items-center justify-center w-full max-w-[480px] border-2 border-dashed pattern-dots p-12"
          style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <Icon icon="mdi:account-lock-outline" width={56} height={56} className="text-muted-foreground opacity-40" />
          <p className="mt-4 text-sm font-bold text-muted-foreground">
            {t('profile.loginToViewProfile')}
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="mt-5 font-bold shadow-flat"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-fg)' }}
          >
            {t('profile.goToLogin')}
          </Button>
        </Card>
      </motion.div>
    );
  }

  if (!profileData) return null;

  const { profile: profileDetail, levelInfo } = profileData;
  const displayUser = profileData.user;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex justify-center"
    >
      <div className="w-full max-w-[720px] flex flex-col gap-5 pb-8">

        {/* ─── Profile Card ─── */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden shadow-flat">
            {/* Banner gradient */}
            <div className="relative h-28 overflow-hidden profile-banner">
              <div className="absolute inset-0 opacity-20 pattern-dots" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              }} />
            </div>

            <div className="px-5 pb-5">
              {/* Avatar + name */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    className="group relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => setAvatarOpen(true)}
                    title={t('settings.changeAvatar')}
                  >
                    <Avatar className="size-20 border-[3px] shadow-flat" style={{ borderColor: 'var(--card-bg)' }}>
                      {displayUser.avatarUrl ? (
                        <AvatarImage src={displayUser.avatarUrl} alt={displayUser.nickname} />
                      ) : null}
                      <AvatarFallback className="text-xl font-extrabold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {displayUser.nickname.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="mdi:camera-plus-outline" width={22} height={22} className="text-white" />
                    </div>
                  </button>
                  {profileDetail?.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-6 rounded-full text-[10px]"
                      style={{ backgroundColor: 'var(--card-bg)', border: '2px solid var(--border-color)' }}>
                      <Icon icon="mdi:check-decagram" width={14} height={14} style={{ color: '#3B82F6' }} />
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-extrabold leading-tight flex items-center gap-1.5">
                      {displayUser.nickname}
                      <span className="text-sm">{USER_LEVEL_ICONS[displayUser.level as UserLevel]}</span>
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground">
                      @{displayUser.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-auto font-bold shrink-0"
                    style={{ boxShadow: 'var(--shadow-flat)' }}
                    onClick={() => navigate('/settings')}
                  >
                    <Icon icon="mdi:pencil-outline" width={14} height={14} className="mr-1.5" />
                    {t('profile.editProfile')}
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <p className={cn('mt-4 text-sm leading-relaxed', profileDetail?.bio ? 'text-foreground' : 'text-muted-foreground italic')}>
                {profileDetail?.bio || t('profile.noBioYet')}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-semibold text-muted-foreground">
                {profileDetail?.occupation && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:briefcase-outline" width={14} height={14} />
                    {profileDetail.occupation}
                  </span>
                )}
                {profileDetail?.education && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:school-outline" width={14} height={14} />
                    {profileDetail.education}
                  </span>
                )}
                {profileDetail?.location && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:map-marker-outline" width={14} height={14} />
                    {profileDetail.location}
                  </span>
                )}
                {profileDetail?.personalWebsite && (
                  <a
                    href={profileDetail.personalWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Icon icon="mdi:web" width={14} height={14} />
                    {t('profile.personalWebsite')}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:calendar-outline" width={14} height={14} />
                  {t('profile.joinedAt')}: {displayUser.createdAt?.slice(0, 7) ?? '—'}
                </span>
              </div>

              {/* Social links */}
              {profileDetail?.socialLinks && Object.keys(profileDetail.socialLinks).length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {Object.entries(profileDetail.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      title={platform}
                    >
                      <Icon icon={socialIconMap[platform.toLowerCase()] ?? 'mdi:link-variant'} width={16} height={16} />
                    </a>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              {/* Level progress */}
              {levelInfo && (
                <LevelProgressBar experience={displayUser.experience} level={displayUser.level} />
              )}

              {/* AI calls remaining */}


              {levelInfo && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-muted-foreground">
                  <Icon icon="mdi:robot-outline" width={13} height={13} />
                  <span>{t('profile.aiCallsRemaining')}: {levelInfo.todayAiCallsRemaining}/{levelInfo.todayAiCallsTotal}</span>
                </div>
              )}

              <Separator className="my-4" />

              {/* Stats */}
              <div className="grid grid-cols-5 gap-2">
                <StatBlock icon="mdi:file-document-outline" value={String(userPosts.length)} label={t('profile.postsCount')} />
                <StatBlock icon="mdi:heart-outline" value={formatCount(totalLikes)} label={t('profile.likesReceived')} />
                <StatBlock icon="mdi:bookmark-outline" value={formatCount(totalCollects)} label={t('profile.collectedCount')} />
                <StatBlock icon="mdi:account-plus-outline" value={formatCount(profileDetail?.followerCount ?? 0)} label={t('profile.followers')} />
                <StatBlock icon="mdi:account-arrow-right-outline" value={formatCount(profileDetail?.followingCount ?? 0)} label={t('profile.following')} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ─── Skills ─── */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-flat p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {t('profile.skills')}
            </h3>
            {profileDetail?.skillsTags && profileDetail.skillsTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileDetail.skillsTags.map((tag) => (
                  <SkillTag key={tag} name={tag} />
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-muted-foreground italic">{t('profile.noSkillsYet')}</p>
            )}
          </Card>
        </motion.div>

        {/* ─── Recent Posts ─── */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-flat overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t('profile.recentPosts')}
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground">
                {userPosts.length}
              </span>
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
                <Icon icon="mdi:file-edit-outline" width={36} height={36} className="text-muted-foreground opacity-30" />
                <p className="text-xs font-medium text-muted-foreground italic">{t('profile.noPostsYet')}</p>
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      <AvatarUpload open={avatarOpen} onOpenChange={setAvatarOpen} />
    </motion.div>
  );
}
