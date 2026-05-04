import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockNotifications, getUnreadCount, formatRelativeTime } from '@/mock/data';
import { cn } from '@/lib/utils';
import type { Notification } from '@linksee/shared';

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: string; color: string; bgColor: string }
> = {
  interaction: {
    icon: 'mdi:account-heart',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  system: {
    icon: 'mdi:cog-outline',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  ai: {
    icon: 'mdi:robot-happy-outline',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

function NotiItem({ notification }: { notification: Notification }) {
  const config = TYPE_CONFIG[notification.type];

  return (
    <button
      type="button"
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 rounded-lg',
        !notification.isRead && 'bg-primary/5',
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 size-9 rounded-[var(--radius-sm)] flex items-center justify-center', config.bgColor)}>
        <Icon icon={config.icon} width={18} height={18} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground truncate">
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="flex-shrink-0 size-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
          {notification.content}
        </p>
        <span className="text-[10px] text-muted-foreground mt-1 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </button>
  );
}

export function NotificationPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const unreadCount = getUnreadCount();

  const tabs: Notification['type'][] = ['interaction', 'system', 'ai'];
  const [activeTab, setActiveTab] = useState<Notification['type'] | 'all'>('all');

  const filtered =
    activeTab === 'all'
      ? mockNotifications
      : mockNotifications.filter((n) => n.type === activeTab);

  const tabLabel: Record<string, string> = {
    all: t('common.search'),
    interaction: t('noti.interaction'),
    system: t('noti.system'),
    ai: t('noti.ai'),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={t('topBar.notifications')}
        >
          <Icon icon="mdi:bell-outline" width={20} height={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 size-[18px] p-0 justify-center text-[10px] font-bold rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden noti-panel border-[1.5px] shadow-flat-lg rounded-[var(--radius-lg)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-extrabold text-foreground">
            {t('noti.title')}
          </h3>
          <button
            type="button"
            className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {t('noti.markAllRead')}
          </button>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2">
          <TabBtn
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label={t('common.search')}
            count={mockNotifications.length}
          />
          {tabs.map((tab) => (
            <TabBtn
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              label={tabLabel[tab]}
              count={mockNotifications.filter((n) => n.type === tab).length}
            />
          ))}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="h-[320px]">
          {filtered.length > 0 ? (
            <div className="flex flex-col py-1">
              {filtered.map((n) => (
                <NotiItem key={n.id} notification={n} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Icon
                icon="mdi:bell-off-outline"
                width={36}
                height={36}
                className="text-muted-foreground/40"
              />
              <p className="text-xs font-bold text-muted-foreground">
                {t('noti.empty')}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                {t('noti.emptyDesc')}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="px-4 py-2">
          <button
            type="button"
            className="w-full text-center text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {t('noti.viewAll')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-[var(--radius-sm)] text-[11px] font-bold transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-flat'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {label}
      <span
        className={cn(
          'ml-1 text-[10px]',
          active ? 'text-primary-foreground/80' : 'text-muted-foreground/60',
        )}
      >
        {count}
      </span>
    </button>
  );
}
