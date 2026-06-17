'use client';

import { useAgentStore } from '../../store/agentStore';
import { ConnectionState } from '../../lib/websocket/ConnectionState';

export function ConnectionIndicator() {
  const connectionState = useAgentStore((state) => state.connectionState);

  // We add STREAMING as an implicit visual state based on whether there's an active stream
  const isStreaming = useAgentStore((state) => state.messages.some(m => m.status === 'streaming'));

  let displayState = connectionState as string;
  if (connectionState === 'CONNECTED' && isStreaming) {
    displayState = 'STREAMING';
  }

  const config: Record<string, { label: string; color: string; dot: string }> = {
    CONNECTED: { label: 'Connected', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-500' },
    STREAMING: { label: 'Streaming', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-500 animate-pulse' },
    CONNECTING: { label: 'Connecting...', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-500 animate-pulse' },
    RECONNECTING: { label: 'Reconnecting...', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-500 animate-pulse' },
    RESUMING: { label: 'Resuming...', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-500 animate-pulse' },
    DISCONNECTED: { label: 'Disconnected', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500' },
  };

  const current = config[displayState] || config.DISCONNECTED;

  return (
    <div className={`px-2.5 py-1 rounded-full border text-[10px] font-medium flex items-center gap-1.5 transition-all ${current.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </div>
  );
}
