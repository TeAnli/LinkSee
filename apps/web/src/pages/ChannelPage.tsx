import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useWebSocket, useWsMessage } from '@/hooks/useWebSocket';
import { useChatStore } from '@/stores/useChatStore';
import { useForumCategories } from '@/hooks/useForumData';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Category, ChatMessageOutPayload, UserJoinedPayload, UserLeftPayload } from '@linksee/shared';

// Flatten categories into a single channel list
function flattenChannels(categories: Category[]): { id: number; name: string; icon: string; parentName?: string }[] {
  const result: { id: number; name: string; icon: string; parentName?: string }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, icon: cat.icon });
    if (cat.children) {
      for (const child of cat.children) {
        result.push({ id: child.id, name: child.name, icon: child.icon, parentName: cat.name });
      }
    }
  }
  return result;
}

const MESSAGE_ANIMATION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function ChannelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { categories, loading: categoriesLoading } = useForumCategories();
  const channels = useMemo(() => flattenChannels(categories), [categories]);

  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { connectionState, sendJoinChannel, sendLeaveChannel, sendChatMessage } = useWebSocket();
  const channelMessages = useChatStore((s) => s.channelMessages);
  const channelOnlineCounts = useChatStore((s) => s.channelOnlineCounts);
  const addChannelMessage = useChatStore((s) => s.addChannelMessage);
  const setChannelOnlineCount = useChatStore((s) => s.setChannelOnlineCount);

  const messages = activeChannelId ? (channelMessages.get(activeChannelId) ?? []) : [];

  // Subscribe to incoming messages
  useWsMessage<ChatMessageOutPayload>('CHAT_MESSAGE', useCallback((payload) => {
    addChannelMessage({
      id: `${payload.channelId}-${payload.timestamp}-${payload.senderSessionId}`,
      channelId: payload.channelId,
      senderSessionId: payload.senderSessionId,
      content: payload.content,
      timestamp: payload.timestamp,
    });
  }, [addChannelMessage]));

  // Subscribe to user join/leave for online counts
  useWsMessage<UserJoinedPayload>('USER_JOINED', useCallback((payload) => {
    setChannelOnlineCount(payload.channelId, payload.onlineCount);
  }, [setChannelOnlineCount]));

  useWsMessage<UserLeftPayload>('USER_LEFT', useCallback((payload) => {
    setChannelOnlineCount(payload.channelId, payload.onlineCount);
  }, [setChannelOnlineCount]));

  // Join channel on select, leave previous
  const handleSelectChannel = useCallback((channelId: number) => {
    if (activeChannelId === channelId) return;
    if (activeChannelId) {
      sendLeaveChannel({ channelId: activeChannelId });
    }
    setActiveChannelId(channelId);
    sendJoinChannel({ channelId });
    setMobileShowChat(true);
  }, [activeChannelId, sendLeaveChannel, sendJoinChannel]);

  // Leave channel on unmount
  useEffect(() => {
    return () => {
      if (activeChannelId) {
        sendLeaveChannel({ channelId: activeChannelId });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeChannelId || connectionState !== 'connected') return;

    sendChatMessage({ channelId: activeChannelId, content: trimmed });
    setMessageInput('');
    inputRef.current?.focus();
  }, [messageInput, activeChannelId, connectionState, sendChatMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  const handleBackToList = () => setMobileShowChat(false);

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col overflow-hidden">
      {/* Desktop layout: side-by-side panels */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Channel List Sidebar */}
        <aside className="w-72 lg:w-80 border-r-[1.5px] border-border bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-border">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:forum-outline" width={18} className="text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">{t('channel.title')}</h2>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
              {connectionState === 'connected'
                ? <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500" />Online</span>
                : <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/40" />Offline</span>
              }
            </Badge>
          </div>
          <ScrollArea className="flex-1">
            {categoriesLoading ? (
              <div className="p-3 flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="p-2 flex flex-col gap-0.5">
                {channels.map((channel) => {
                  const isActive = activeChannelId === channel.id;
                  const onlineCount = channelOnlineCounts.get(channel.id) ?? 0;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleSelectChannel(channel.id)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted/60 text-foreground',
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center size-9 rounded-lg shrink-0',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}>
                        <Icon icon={channel.icon} width={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">
                          {channel.parentName ? (
                            <span className="text-muted-foreground/60 text-[11px]">{channel.parentName} / </span>
                          ) : null}
                          {channel.name}
                        </div>
                      </div>
                      {onlineCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                          {onlineCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b-[1.5px] border-border bg-background shrink-0">
                <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
                  <Icon icon={activeChannel.icon} width={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{activeChannel.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {channelOnlineCounts.get(activeChannel.id) ?? 0} {t('channel.online')}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="p-4 flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Icon icon="mdi:chat-outline" width={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('channel.noMessages')}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{t('channel.startConversation')}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isOwn = msg.senderSessionId === user?.id?.toString();
                        const showAvatar = idx === 0 || messages[idx - 1]!.senderSessionId !== msg.senderSessionId;
                        return (
                          <motion.div
                            key={msg.id}
                            {...MESSAGE_ANIMATION}
                            className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                          >
                            {showAvatar ? (
                              <div className={cn(
                                'flex items-center justify-center size-8 rounded-full shrink-0 text-[11px] font-bold',
                                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                              )}>
                                {msg.senderSessionId.slice(0, 2).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-8 shrink-0" />
                            )}
                            <div className={cn(
                              'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-md'
                                : 'bg-background border border-border rounded-tl-md',
                            )}>
                              {showAvatar && (
                                <p className="text-[10px] font-semibold mb-0.5 opacity-60">
                                  {isOwn ? t('channel.you') : msg.senderSessionId.slice(0, 8)}
                                </p>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className="text-[10px] mt-1 opacity-50 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t-[1.5px] border-border bg-background shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('channel.typeMessage')}
                    maxLength={500}
                    disabled={connectionState !== 'connected'}
                    className="flex-1 h-10 text-sm rounded-xl"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!messageInput.trim() || connectionState !== 'connected'}
                    className="size-10 rounded-xl shrink-0"
                  >
                    <Icon icon="mdi:send" width={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <Icon icon="mdi:forum-outline" width={32} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{t('channel.selectChannel')}</p>
                <p className="text-xs text-muted-foreground/50">{t('channel.selectChannelHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout: channel list or chat */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        <AnimatePresence mode="wait">
          {!mobileShowChat ? (
            <motion.div
              key="channel-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b-[1.5px] border-border">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="size-8 shrink-0">
                  <Icon icon="mdi:arrow-left" width={18} />
                </Button>
                <Icon icon="mdi:forum-outline" width={18} className="text-primary" />
                <h2 className="text-sm font-extrabold text-foreground">{t('channel.title')}</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 ml-auto">
                  {connectionState === 'connected'
                    ? <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500" />Online</span>
                    : <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/40" />Offline</span>
                  }
                </Badge>
              </div>
              <ScrollArea className="flex-1">
                {categoriesLoading ? (
                  <div className="p-3 flex flex-col gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="p-2 flex flex-col gap-1">
                    {channels.map((channel) => {
                      const isActive = activeChannelId === channel.id;
                      const onlineCount = channelOnlineCounts.get(channel.id) ?? 0;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => handleSelectChannel(channel.id)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-left w-full transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-muted/60 text-foreground',
                          )}
                        >
                          <div className={cn(
                            'flex items-center justify-center size-10 rounded-xl shrink-0',
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                          )}>
                            <Icon icon={channel.icon} width={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {channel.parentName ? (
                                <span className="text-muted-foreground/50 text-[11px]">{channel.parentName} / </span>
                              ) : null}
                              {channel.name}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {onlineCount > 0 ? `${onlineCount} ${t('channel.online')}` : t('channel.noOneOnline')}
                            </p>
                          </div>
                          <Icon icon="mdi:chevron-right" width={20} className="text-muted-foreground/40" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Mobile chat header */}
              <div className="flex items-center gap-3 px-3 py-2.5 border-b-[1.5px] border-border bg-background shrink-0">
                <Button variant="ghost" size="icon" onClick={handleBackToList} className="size-8 shrink-0">
                  <Icon icon="mdi:arrow-left" width={18} />
                </Button>
                {activeChannel && (
                  <>
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                      <Icon icon={activeChannel.icon} width={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{activeChannel.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {channelOnlineCounts.get(activeChannel.id) ?? 0} {t('channel.online')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile messages */}
              <ScrollArea className="flex-1">
                <div className="p-3 flex flex-col gap-2.5">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Icon icon="mdi:chat-outline" width={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('channel.noMessages')}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isOwn = msg.senderSessionId === user?.id?.toString();
                        const showAvatar = idx === 0 || messages[idx - 1]!.senderSessionId !== msg.senderSessionId;
                        return (
                          <motion.div
                            key={msg.id}
                            {...MESSAGE_ANIMATION}
                            className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                          >
                            {showAvatar ? (
                              <div className={cn(
                                'flex items-center justify-center size-7 rounded-full shrink-0 text-[10px] font-bold',
                                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                              )}>
                                {msg.senderSessionId.slice(0, 2).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-7 shrink-0" />
                            )}
                            <div className={cn(
                              'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-md'
                                : 'bg-background border border-border rounded-tl-md',
                            )}>
                              {showAvatar && (
                                <p className="text-[10px] font-semibold mb-0.5 opacity-60">
                                  {isOwn ? t('channel.you') : msg.senderSessionId.slice(0, 8)}
                                </p>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className="text-[10px] mt-1 opacity-50 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Mobile message input */}
              <div className="p-2.5 border-t-[1.5px] border-border bg-background shrink-0"
                style={{ paddingBottom: 'calc(10px + 60px + env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('channel.typeMessage')}
                    maxLength={500}
                    disabled={connectionState !== 'connected'}
                    className="flex-1 h-10 text-sm rounded-xl"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!messageInput.trim() || connectionState !== 'connected'}
                    className="size-10 rounded-xl shrink-0"
                  >
                    <Icon icon="mdi:send" width={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
