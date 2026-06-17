'use client';

import { useAgentStore } from '../../store/agentStore';

export function ChaosDebugPanel() {
  const connectionState = useAgentStore((state) => state.connectionState);
  const metrics = useAgentStore((state) => state.debugMetrics);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur text-green-400 font-mono text-[10px] p-3 rounded border border-green-900/50 shadow-lg pointer-events-none w-64">
      <div className="font-bold border-b border-green-900/50 pb-1 mb-2 text-green-300">
        CHAOS DEBUG PANEL
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="opacity-70">Connection:</span>
          <span>{connectionState}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Highest Seq:</span>
          <span>{metrics.highestProcessedSeq}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Buffered:</span>
          <span>{metrics.bufferedMessagesCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Processed:</span>
          <span>{metrics.processedMessagesCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Duplicates Dropped:</span>
          <span>{metrics.duplicateMessagesDropped}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Out-Of-Order Buffered:</span>
          <span>{metrics.outOfOrderMessagesBuffered}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Reconnects:</span>
          <span>{metrics.reconnectCount}</span>
        </div>
      </div>
    </div>
  );
}
