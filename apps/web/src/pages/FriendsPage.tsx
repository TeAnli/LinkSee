import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi } from '@linksee/api-client/user';
import { USER_LEVEL_NAMES, USER_LEVEL_ICONS } from '@linksee/shared';
import { UserLevel } from '@linksee/shared';
import type { UserInfo } from '@linksee/shared';
import { fadeUp, staggerSlow as stagger } from '@/lib/animation';

const PAGE_SIZE = 20;

function UserListItem({ user }: { user: UserInfo }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => navigate(`/user/${user.id}`)}
      className="flex items-center gap-3 p-3 rounded-xl text-left w-full transition-colors hover:bg-muted/60 cursor-pointer group"
    >
      <Avatar className="size-11 shrink-0">
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt={user.nickname} />
        ) : null}
        <AvatarFallback className="text-sm font-extrabold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
          {user.nickname.slice(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {user.nickname}
          </span>
          <span className="text-sm">{USER_LEVEL_ICONS[user.level as UserLevel]}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          @{user.username} · {USER_LEVEL_NAMES[user.level as UserLevel]}
        </p>
      </div>

      <Icon icon="mdi:chevron-right" width={18} className="text-muted-foreground/30 shrink-0" />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); navigate(`/messages/dm/${user.id}`); }}
        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0"
        title={t('user.sendMessage')}
      >
        <Icon icon="mdi:message-outline" width={16} />
      </button>
    </button>
  );
}

function UserListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FriendsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<UserInfo[]>([]);
  const [following, setFollowing] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = useCallback(async (tab: string, pageNum: number) => {
    setLoading(true);
    try {
      const api = tab === 'followers' ? userApi.getFollowers : userApi.getFollowing;
      const res = await api({ page: pageNum, size: PAGE_SIZE });
      const data = res.data.data;
      const list = data.list ?? [];
      const setter = tab === 'followers' ? setFollowers : setFollowing;

      if (pageNum === 1) {
        setter(list);
      } else {
        setter((prev) => [...prev, ...list]);
      }
      setHasMore(data.hasMore);
    } catch {
      if (pageNum === 1) {
        const setter = tab === 'followers' ? setFollowers : setFollowing;
        setter([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchData(activeTab, 1);
  }, [activeTab, fetchData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(activeTab, nextPage);
  };

  const currentList = activeTab === 'followers' ? followers : following;
  const currentLoading = loading;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex justify-center"
    >
      <div className="w-full max-w-[640px] flex flex-col gap-4 pb-8">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="size-8 shrink-0">
            <Icon icon="mdi:arrow-left" width={18} />
          </Button>
          <h2 className="text-lg font-extrabold text-foreground">{t('friends.title')}</h2>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')}>
            <TabsList className="w-full h-10 p-1 bg-muted/60">
              <TabsTrigger value="followers" className="flex-1 h-8 text-sm font-semibold gap-1.5">
                <Icon icon="mdi:account-plus-outline" width={16} />
                {t('friends.followers')}
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1 h-8 text-sm font-semibold gap-1.5">
                <Icon icon="mdi:account-arrow-right-outline" width={16} />
                {t('friends.following')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* User List */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-flat overflow-hidden">
            <AnimatePresence mode="wait">
              {currentLoading && page === 1 ? (
                <UserListSkeleton />
              ) : currentList.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ScrollArea className="max-h-[calc(100vh-280px)]">
                    <div className="divide-y" style={{ borderColor: 'var(--muted)' }}>
                      {currentList.map((user) => (
                        <UserListItem key={user.id} user={user} />
                      ))}
                    </div>
                  </ScrollArea>

                  {hasMore && (
                    <div className="flex justify-center p-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="font-semibold"
                      >
                        {loading ? (
                          <Icon icon="mdi:loading" width={14} className="animate-spin mr-1.5" />
                        ) : null}
                        {t('friends.loadMore')}
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Icon icon="mdi:account-group-outline" width={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {activeTab === 'followers' ? t('friends.noFollowers') : t('friends.noFollowing')}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {activeTab === 'followers' ? t('friends.noFollowersHint') : t('friends.noFollowingHint')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
