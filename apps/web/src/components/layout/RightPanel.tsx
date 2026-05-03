import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

function TopicTags() {
  const tags = [
    { id: 1, hue: 250 },
    { id: 2, hue: 270 },
    { id: 3, hue: 290 },
    { id: 4, hue: 310 },
    { id: 5, hue: 330 },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Badge key={t.id} variant="secondary" className="cursor-default">
          Topic {t.id}
        </Badge>
      ))}
    </div>
  );
}

function UserList() {
  return (
    <div className="flex flex-col gap-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">U{i}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-muted-foreground">
            User {i}
          </span>
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card
        className={accent ? 'border-primary' : 'hover:border-primary/30 hover:shadow-flat-hover transition-all duration-200 cursor-default'}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon
              icon={icon}
              width={18}
              height={18}
              className={accent ? 'text-primary-foreground' : 'text-primary'}
            />
            <span className={`text-sm font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>
              {title}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {title === 'Hot Topics' && <TopicTags />}
          {title === 'Active Users' && <UserList />}
          {title === 'AI Picks' && (
            <Skeleton className="h-10 w-full rounded-lg" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RightPanel() {
  return (
    <aside
      className="hidden xl:flex flex-col w-[280px] fixed right-0 top-[60px] bottom-0 border-l-[1.5px] border-border bg-background"
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
