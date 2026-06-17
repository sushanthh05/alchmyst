'use client';

import { useEffect, useState, useCallback } from 'react';
import { wsManager } from '../lib/websocket/WebSocketManager';
import { ServerMessage } from '../lib/protocol/types';
import { ConnectionState } from '../lib/websocket/ConnectionState';

export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [lastSeq, setLastSeq] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<ServerMessage[]>([]);

  useEffect(() => {
    const unsubscribeStatus = wsManager.onStatusChange((status) => {
      setConnectionState(status);
    });

    const unsubscribeMessage = wsManager.onMessage((event) => {
      setLastEvent(event.type);
      setTotalEvents((prev) => prev + 1);
      if (event.seq !== undefined) {
        setLastSeq(event.seq);
      }
      setRecentEvents((prev) => {
        const newEvents = [...prev, event];
        return newEvents.slice(-20); // Keep last 20
      });
    });

    wsManager.connect();

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      // Intentionally omitting wsManager.disconnect() to avoid breaking active sockets on rerenders/strict mode
    };
  }, []);

  const sendUserMessage = useCallback((content: string) => {
    wsManager.sendUserMessage(content);
  }, []);

  return { connectionState, lastEvent, totalEvents, lastSeq, recentEvents, sendUserMessage };
}
