import { Icon } from '@iconify/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TOPBAR_HEIGHT } from './Sidebar';
import { mockTags, mockUsers, formatCount } from '@/mock/data';

const RIGHT_PANEL_WIDTH = 280;

export { RIGHT_PANEL_WIDTH };

function TopicTags() {
  const hotTags = mockTags.slice(0, 10);
  return (
    <div className="flex flex-wrap gap-2">
      {hotTags.map((t) => (
        <Badge key={t.name} variant="secondary" className="cursor-pointer transition-colors hover:bg-primary/15 hover:text-primary">
          {t.name}
          <span className="ml-1 text-[10px] text-muted-foreground">{formatCount(t.count)}</span>
        </Badge>
      ))}
    </div>
  );
}

function UserList() {
  const activeUsers = mockUsers.slice(0, 5);
  return (
    <div className="flex flex-col gap-2.5">
      {activeUsers.map((u) => (
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

function PlaceholderCard({
  title,
  icon,
  accent = false,
}: {
  title: string;
  icon: string;
  accent?: boolean;
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
        {title === 'Hot Topics' && <TopicTags />}
        {title === 'Active Users' && <UserList />}
        {title === 'AI Picks' && <Skeleton className="h-10 w-full rounded-lg" />}
      </CardContent>
    </Card>
  );
}

export function RightPanel() {
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
          <PlaceholderCard title="Hot Topics" icon="mdi:fire" />
          <PlaceholderCard title="Active Users" icon="mdi:account-group-outline" />
          <PlaceholderCard title="AI Picks" icon="mdi:robot-happy" accent />
        </div>
      </ScrollArea>
    </aside>
  );
}
