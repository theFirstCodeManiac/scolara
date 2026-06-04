import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface HubMessage {
  id: string;
  group_id: string;
  sender_id: string;
  body: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
}

interface UseHubRealtimeOptions {
  groupId: string | null;
  onNewMessage?: (message: HubMessage) => void;
  onMessageUpdate?: (message: HubMessage) => void;
  onMessageDelete?: (messageId: string) => void;
}

export const useHubRealtime = ({
  groupId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
}: UseHubRealtimeOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribe = useCallback(() => {
    if (!groupId) return;

    // Unsubscribe previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`hub_group_chat_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hub_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (onNewMessage) onNewMessage(payload.new as HubMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hub_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const updated = payload.new as HubMessage;
          if (updated.is_deleted && onMessageDelete) {
            onMessageDelete(updated.id);
          } else if (onMessageUpdate) {
            onMessageUpdate(updated);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [groupId, onNewMessage, onMessageUpdate, onMessageDelete]);

  useEffect(() => {
    subscribe();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [subscribe]);
};

// Hook for real-time notifications
interface UseHubNotificationsOptions {
  userId: string | null;
  onNotification?: (notification: Record<string, unknown>) => void;
}

export const useHubNotifications = ({ userId, onNotification }: UseHubNotificationsOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`hub_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hub_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onNotification) onNotification(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotification]);
};
