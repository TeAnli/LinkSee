import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/format';
import { notificationApi } from '@linksee/api-client/notification';
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

function NotiItem({
  notification,
  isRead,
  onMarkRead,
}: {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: number) => void;
}) {
  const config = TYPE_CONFIG[notification.type];

  const handleClick = () => {
    if (!isRead) onMarkRead(notification.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 rounded-lg group',
        !isRead && 'bg-primary/5',
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 size-9 rounded-lg flex items-center justify-center',
          config.bgColor
        )}
      >
        <Icon icon={config.icon} width={18} height={18} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground truncate">
            {notification.title}
          </span>
          <AnimatePresence>
            {!isRead && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="shrink-0 size-2 rounded-full bg-primary"
              />
            )}
          </AnimatePresence>
        </div>
        <p
          className={cn(
            'text-xs leading-relaxed mt-0.5 line-clamp-2',
            isRead ? 'text-muted-foreground' : 'text-foreground/80'
          )}
        >
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await notificationApi.list();
        if (!cancelled) {
          const raw = res.data.data as { list?: Notification[] } | Notification[];
          const data = Array.isArray(raw) ? raw : (raw as { list?: Notification[] })?.list ?? [];
          setNotifications(data);
          setReadIds(new Set(data.filter((n: Notification) => n.isRead).map((n: Notification) => n.id)));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [open]);

  const unreadCount = notifications.length - readIds.size;

  const markRead = useCallback((id: number) => {
    setReadIds((prev) => new Set(prev).add(id));
    notificationApi.markRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
    notificationApi.markAllRead().catch(() => {});
  }, [notifications]);

  const tabs: Notification['type'][] = ['interaction', 'system', 'ai'];
  const [activeTab, setActiveTab] = useState<Notification['type'] | 'all'>('all');

  const filtered =
    activeTab === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const filteredUnread = filtered.filter((n) => !readIds.has(n.id)).length;

  const tabLabel: Record<string, string> = {
    all: t('noti.title'),
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
          <AnimatePresence>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-[18px] p-0 justify-center text-[10px] font-bold rounded-full"
              >
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              </Badge>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden noti-panel border-[1.5px] shadow-flat-lg rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-extrabold text-foreground">
            {t('noti.title')}
            {unreadCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
            >
              {t('noti.markAllRead')}
            </button>
          )}
        </div>

        <Separator />

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2">
          <TabBtn
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label={tabLabel.all!!}
            badge={activeTab === 'all' ? filteredUnread : undefined}
          />
          {tabs.map((tab) => {
            const count =
              activeTab === tab
                ? notifications.filter(
                  (n) => n.type === tab && !readIds.has(n.id)
                ).length
                : undefined;
            return (
              <TabBtn
                key={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                label={tabLabel[tab]!!}
                badge={count}
              />
            );
          })}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Icon icon="mdi:loading" width={24} className="animate-spin text-muted-foreground/40" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col py-1">
              {filtered.map((n) => (
                <NotiItem
                  key={n.id}
                  notification={n}
                  isRead={readIds.has(n.id)}
                  onMarkRead={markRead}
                />
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
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1',
        active
          ? 'bg-primary text-primary-foreground shadow-flat'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'ml-0.5 text-[10px] min-w-[14px] text-center px-1 rounded-full',
            active
              ? 'text-primary-foreground/80 bg-primary-foreground/20'
              : 'text-primary bg-primary/10'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
