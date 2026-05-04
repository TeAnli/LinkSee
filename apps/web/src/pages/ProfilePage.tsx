import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, type Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserProfile, mockPosts, formatCount, formatRelativeTime } from '@/mock/data';
import { USER_LEVEL_NAMES, USER_LEVEL_ICONS, USER_LEVEL_EXP } from '@linksee/shared';
import { UserLevel } from '@linksee/shared';
import { cn } from '@/lib/utils';

/* ── Animation Variants ── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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

function PostItem({ post }: { post: typeof mockPosts[number] }) {
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

  const profile = useMemo(() => {
    if (!user) return null;
    return getUserProfile(user.id);
  }, [user]);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return mockPosts.filter((p) => p.author.id === user.id);
  }, [user]);

  const totalLikes = useMemo(
    () => userPosts.reduce((sum, p) => sum + p.likeCount, 0),
    [userPosts],
  );
  const totalCollects = useMemo(
    () => userPosts.reduce((sum, p) => sum + p.collectCount, 0),
    [userPosts],
  );

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

  if (!profile) return null;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
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
                  <Avatar className="size-20 border-[3px] shadow-flat" style={{ borderColor: 'var(--card-bg)' }}>
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
                    ) : null}
                    <AvatarFallback className="text-xl font-extrabold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {profile.nickname.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-6 rounded-full text-[10px]"
                      style={{ backgroundColor: 'var(--card-bg)', border: '2px solid var(--border-color)' }}>
                      <Icon icon="mdi:check-decagram" width={14} height={14} style={{ color: '#3B82F6' }} />
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-extrabold leading-tight flex items-center gap-1.5">
                      {profile.nickname}
                      <span className="text-sm">{USER_LEVEL_ICONS[profile.level as UserLevel]}</span>
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground">
                      @{profile.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-auto font-bold shrink-0"
                    style={{ boxShadow: 'var(--shadow-flat)' }}
                  >
                    <Icon icon="mdi:pencil-outline" width={14} height={14} className="mr-1.5" />
                    {t('profile.editProfile')}
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <p className={cn('mt-4 text-sm leading-relaxed', profile.bio ? 'text-foreground' : 'text-muted-foreground italic')}>
                {profile.bio || t('profile.noBioYet')}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-semibold text-muted-foreground">
                {profile.occupation && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:briefcase-outline" width={14} height={14} />
                    {profile.occupation}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:map-marker-outline" width={14} height={14} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:calendar-outline" width={14} height={14} />
                  {t('profile.joinedAt')}: 2024-01
                </span>
              </div>

              <Separator className="my-4" />

              {/* Level progress */}
              <LevelProgressBar experience={profile.experience} level={profile.level} />

              <Separator className="my-4" />

              {/* Stats */}
              <div className="grid grid-cols-5 gap-2">
                <StatBlock icon="mdi:file-document-outline" value={String(userPosts.length)} label={t('profile.postsCount')} />
                <StatBlock icon="mdi:heart-outline" value={formatCount(totalLikes)} label={t('profile.likesReceived')} />
                <StatBlock icon="mdi:bookmark-outline" value={formatCount(totalCollects)} label={t('profile.collectedCount')} />
                <StatBlock icon="mdi:account-plus-outline" value={formatCount(profile.followerCount)} label={t('profile.followers')} />
                <StatBlock icon="mdi:account-arrow-right-outline" value={formatCount(profile.followingCount)} label={t('profile.following')} />
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
            {profile.skillsTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skillsTags.map((tag) => (
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
    </motion.div>
  );
}
