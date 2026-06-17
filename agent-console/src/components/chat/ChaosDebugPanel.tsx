'use client';

import { useState } from 'react';
import { useAgentStore } from '../../store/agentStore';

export function ChaosDebugPanel() {
  const connectionState = useAgentStore((state) => state.connectionState);
  const metrics = useAgentStore((state) => state.debugMetrics);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--panel)] border-t border-[var(--border-color)]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[var(--hover-color)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Chaos Diagnostics
        </div>
        <span>{isExpanded ? '▼' : '▲'}</span>
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 text-[10px] font-mono text-green-400 space-y-1 bg-[#02040A]">
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
      )}
    </div>
  );
}
