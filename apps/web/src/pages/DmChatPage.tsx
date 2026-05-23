import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useWebSocket, useWsMessage } from '@/hooks/useWebSocket';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import type { DmMessageOutPayload, FriendOnlinePayload, FriendOfflinePayload, OnlineFriendsPayload, UserInfo } from '@linksee/shared';

const MESSAGE_ANIMATION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function DmChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const partnerUserId = useMemo(() => Number(userId), [userId]);

  const currentUser = useAuthStore((s) => s.user);
  const { connectionState, sendDmMessage } = useWebSocket();
  const dmMessages = useChatStore((s) => s.dmMessages);
  const onlineFriendIds = useChatStore((s) => s.onlineFriendIds);
  const addDmMessage = useChatStore((s) => s.addDmMessage);
  const addOnlineFriend = useChatStore((s) => s.addOnlineFriend);
  const removeOnlineFriend = useChatStore((s) => s.removeOnlineFriend);
  const setOnlineFriends = useChatStore((s) => s.setOnlineFriends);

  const [partner, setPartner] = useState<UserInfo | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useMemo(
    () => (dmMessages.get(partnerUserId) ?? []),
    [dmMessages, partnerUserId],
  );

  const isOnline = onlineFriendIds.has(partnerUserId);

  // Fetch partner profile
  useEffect(() => {
    if (!partnerUserId) return;

    let cancelled = false;
    setLoading(true);

    userApi.getUsersProfile(partnerUserId).then((res) => {
      if (!cancelled) setPartner(res.data.data.user);
    }).catch(() => {
      if (!cancelled) setPartner(null);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [partnerUserId]);

  // Subscribe to incoming DM messages
  useWsMessage<DmMessageOutPayload>('DM_MESSAGE', useCallback((payload) => {
    const senderUserId = Number(payload.senderSessionId);
    if (senderUserId === currentUser?.id) return; // echo of our own message
    addDmMessage({
      id: `dm-${payload.timestamp}-${payload.senderSessionId}`,
      senderSessionId: payload.senderSessionId,
      partnerUserId: senderUserId,
      content: payload.content,
      timestamp: payload.timestamp,
    });
  }, [addDmMessage, currentUser?.id]));

  // Subscribe to online status
  useWsMessage<OnlineFriendsPayload>('ONLINE_FRIENDS', useCallback((payload) => {
    setOnlineFriends(payload.onlineFriendIds);
  }, [setOnlineFriends]));

  useWsMessage<FriendOnlinePayload>('FRIEND_ONLINE', useCallback((payload) => {
    addOnlineFriend(payload.userId);
  }, [addOnlineFriend]));

  useWsMessage<FriendOfflinePayload>('FRIEND_OFFLINE', useCallback((payload) => {
    removeOnlineFriend(payload.userId);
  }, [removeOnlineFriend]));

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = messageInput.trim();
    if (!trimmed || !currentUser || connectionState !== 'connected') return;

    const now = new Date().toISOString();
    addDmMessage({
      id: `dm-${now}-${currentUser.id}`,
      senderSessionId: String(currentUser.id),
      partnerUserId,
      content: trimmed,
      timestamp: now,
    });
    sendDmMessage({ targetUserId: partnerUserId, content: trimmed });
    setMessageInput('');
    inputRef.current?.focus();
  }, [messageInput, currentUser, connectionState, partnerUserId, addDmMessage, sendDmMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-60px)] flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b-[1.5px] border-border bg-background shrink-0">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Icon icon="mdi:account-off-outline" width={48} className="text-muted-foreground opacity-40" />
          <p className="text-sm font-bold text-muted-foreground">{t('user.notFound')}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="font-bold">
            {t('common.back')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-[1.5px] border-border bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="size-8 shrink-0">
          <Icon icon="mdi:arrow-left" width={18} />
        </Button>
        <div
          className={cn(
            'flex items-center justify-center size-9 rounded-full shrink-0 text-sm font-extrabold',
            'bg-primary text-primary-foreground',
          )}
        >
          {partner.nickname.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{partner.nickname}</h3>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className={cn('size-1.5 rounded-full', isOnline ? 'bg-green-500' : 'bg-muted-foreground/40')} />
            {isOnline ? t('dm.online') : t('dm.offline')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-[720px] mx-auto p-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon icon="mdi:chat-outline" width={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t('dm.noMessages')}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t('dm.startConversation')}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isOwn = Number(msg.senderSessionId) === currentUser?.id;
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
                        {isOwn ? currentUser?.nickname?.slice(0, 1) ?? '?' : partner.nickname.slice(0, 1)}
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
                          {isOwn ? t('dm.you') : partner.nickname}
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
        <div className="max-w-[720px] mx-auto flex items-center gap-2">
          <Input
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('dm.typeMessage')}
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
    </div>
  );
}
