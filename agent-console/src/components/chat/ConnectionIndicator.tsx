'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { ConnectionState } from '../../lib/websocket/ConnectionState';
import { wsManager } from '../../lib/websocket/WebSocketManager';

export function ConnectionIndicator() {
  const connectionState = useAgentStore((state) => state.connectionState);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show instantly on disconnect, but delay "Connected" hiding so user sees it.
    if (connectionState !== 'CONNECTED') {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [connectionState]);

  // Remove early return to keep the button visible even when the pill hides

  const config: Record<ConnectionState, { label: string; color: string; dot: string }> = {
    CONNECTED: { label: 'Connected', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
    CONNECTING: { label: 'Connecting...', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500 animate-pulse' },
    RECONNECTING: { label: 'Reconnecting...', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500 animate-pulse' },
    RESUMING: { label: 'Resuming...', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800', dot: 'bg-indigo-500 animate-pulse' },
    DISCONNECTED: { label: 'Disconnected', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', dot: 'bg-red-500' },
  };

  const current = config[connectionState] || config.DISCONNECTED;

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
      {visible && (
        <div className={`px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium flex items-center gap-2 transition-all duration-300 ${current.color}`}>
          <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>
          {current.label}
        </div>
      )}
      {isDev && (
        <button
          onClick={() => wsManager.debugDisconnect()}
          className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow-sm opacity-80 hover:opacity-100 transition-opacity"
        >
          Disconnect WS
        </button>
      )}
    </div>
  );
}
