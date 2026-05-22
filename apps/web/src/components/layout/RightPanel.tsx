import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TOPBAR_HEIGHT } from './Sidebar';
import { formatCount } from '@/lib/format';
import { userApi } from '@linksee/api-client/user';
import { forumApi } from '@linksee/api-client/forum';
import type { UserInfo, Category, PostListItem } from '@linksee/shared';

const RIGHT_PANEL_WIDTH = 280;

export { RIGHT_PANEL_WIDTH };

function TopicTags() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await forumApi.listCategories();
        if (!cancelled) {
          const raw = res.data.data;
          setCategories(Array.isArray(raw) ? raw : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex flex-wrap gap-2"><Skeleton className="h-5 w-14" /><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-12" /></div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.slice(0, 10).map((cat) => (
        <Badge key={cat.id} variant="secondary" className="cursor-pointer transition-colors hover:bg-primary/15 hover:text-primary">
          {cat.name}
          <span className="ml-1 text-[10px] text-muted-foreground">{formatCount(cat.postCount)}</span>
        </Badge>
      ))}
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState<Pick<UserInfo, 'id' | 'nickname' | 'avatarUrl' | 'level'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await userApi.getRankings();
        if (!cancelled) {
          const raw = res.data.data;
          setUsers(Array.isArray(raw) ? raw : (raw as { list?: Pick<UserInfo, 'id' | 'nickname' | 'avatarUrl' | 'level'>[] } | null)?.list ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex flex-col gap-2.5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {users.slice(0, 5).map((u) => (
        <div key={u.id} className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {u.nickname.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-muted-foreground">{u.nickname}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/60">Lv.{u.level}</span>
        </div>
      ))}
    </div>
  );
}

function RightCard({
  title,
  icon,
  accent = false,
  children,
}: {
  title: string;
  icon: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-default',
        accent ? 'border-primary' : 'hover:border-primary/30 hover:shadow-flat-hover',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon={icon}
            width={18}
            height={18}
            className={accent ? 'text-primary-foreground' : 'text-primary'}
          />
          <span className={cn('text-sm font-bold', accent ? 'text-primary' : 'text-foreground')}>
            {title}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function HotPosts() {
  const [posts, setPosts] = useState<Pick<PostListItem, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await forumApi.listPosts({ sort: 'hot', size: 5 });
        if (!cancelled) {
          const raw = res.data.data as { list?: Pick<PostListItem, 'id' | 'title'>[] };
          setPosts(raw?.list ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {posts.map((p, i) => (
        <a
          key={p.id}
          href={`/post/${p.id}`}
          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
        >
          <span className="text-[10px] font-bold text-primary/50 w-3 shrink-0">{i + 1}</span>
          {p.title}
        </a>
      ))}
    </div>
  );
}

export function RightPanel() {
  const { t } = useTranslation();

  return (
    <aside
      className="hidden xl:flex flex-col fixed right-0 border-l-[1.5px] border-border bg-background"
      style={{
        width: `${RIGHT_PANEL_WIDTH}px`,
        top: `${TOPBAR_HEIGHT}px`,
        bottom: 0,
      }}
    >
      <ScrollArea className="flex-1 p-5">
        <div className="flex flex-col gap-4">
          <RightCard title={t('rightPanel.hotTopics')} icon="mdi:fire">
            <TopicTags />
          </RightCard>
          <RightCard title={t('rightPanel.activeUsers')} icon="mdi:account-group-outline">
            <UserList />
          </RightCard>
          <RightCard title={t('rightPanel.aiPicks')} icon="mdi:trending-up" accent>
            <HotPosts />
          </RightCard>
        </div>
      </ScrollArea>
    </aside>
  );
}
