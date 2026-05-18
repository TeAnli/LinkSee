import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { WsClient } from '@/lib/ws-client';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  AuthPayload,
  ChannelPayload,
  ChatMessagePayload,
  DmMessagePayload,
} from '@linksee/shared';

const WS_URL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/chat`;

let clientInstance: WsClient | null = null;

function subscribeToState(cb: () => void): () => void {
  const interval = setInterval(cb, 500);
  return () => clearInterval(interval);
}

function getSnapshot(): WsClient['connectionState'] {
  return clientInstance?.connectionState ?? 'disconnected';
}

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const connectionState = useSyncExternalStore(subscribeToState, getSnapshot);

  useEffect(() => {
    if (!token || !user) {
      clientInstance?.disconnect();
      clientInstance = null;
      return;
    }

    if (clientInstance) {
      clientInstance.updateToken(token);
      if (clientInstance.connectionState === 'disconnected') {
        clientInstance.connect();
      }
      return;
    }

    const client = new WsClient({ url: WS_URL, token });
    clientInstance = client;
    client.connect();

    const unsub = subscribeOnce(client, () => {
      client.sendAuth({ userId: user.id } satisfies AuthPayload);
    });

    return () => {
      unsub();
    };
  }, [token, user?.id]);

  useEffect(() => {
    return () => {
      clientInstance?.disconnect();
      clientInstance = null;
    };
  }, []);

  const sendJoinChannel = useCallback((payload: ChannelPayload) => {
    clientInstance?.sendJoinChannel(payload);
  }, []);

  const sendLeaveChannel = useCallback((payload: ChannelPayload) => {
    clientInstance?.sendLeaveChannel(payload);
  }, []);

  const sendChatMessage = useCallback((payload: ChatMessagePayload) => {
    clientInstance?.sendChatMessage(payload);
  }, []);

  const sendDmMessage = useCallback((payload: DmMessagePayload) => {
    clientInstance?.sendDmMessage(payload);
  }, []);

  return {
    connectionState,
    sendJoinChannel,
    sendLeaveChannel,
    sendChatMessage,
    sendDmMessage,
  } as const;
}

export function useWsMessage<T>(type: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let unsub = () => {};

    if (clientInstance) {
      unsub = clientInstance.on(type, (payload: unknown) => handlerRef.current(payload as T));
      return unsub;
    }

    // Client not ready yet — poll until available, then subscribe
    const id = setInterval(() => {
      if (clientInstance) {
        clearInterval(id);
        unsub = clientInstance.on(type, (payload: unknown) => handlerRef.current(payload as T));
      }
    }, 100);

    return () => {
      clearInterval(id);
      unsub();
    };
  }, [type]);
}

function subscribeOnce(client: WsClient, cb: () => void): () => void {
  let fired = false;
  const interval = setInterval(() => {
    if (!fired && client.connectionState === 'connected') {
      fired = true;
      cb();
    }
  }, 100);
  return () => clearInterval(interval);
}
