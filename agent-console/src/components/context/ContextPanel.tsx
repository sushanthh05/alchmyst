'use client';

import { useMemo } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { diffObjects } from '../../lib/context/diff';
import { ContextTree } from './ContextTree';
import { ContextHistoryControls } from './ContextHistoryControls';
import { DiffSummary } from './DiffSummary';
import { ChaosDebugPanel } from '../chat/ChaosDebugPanel';

export function ContextPanel() {
  const activeContextId = useAgentStore((state) => state.activeContextId);
  const contexts = useAgentStore((state) => state.contexts);

  const activeHistory = contexts.find(c => c.contextId === activeContextId);

  // Memoize the diff computation so it only runs when the selected snapshot changes
  const diffResult = useMemo(() => {
    if (!activeHistory || activeHistory.currentIndex === 0) return null;
    
    const prevData = activeHistory.snapshots[activeHistory.currentIndex - 1].data;
    const currData = activeHistory.snapshots[activeHistory.currentIndex].data;
    
    console.log('[CONTEXT] Diff computed');
    return diffObjects(prevData, currData);
  }, [activeHistory]);

  if (!activeContextId || !activeHistory) {
    return (
      <div className="flex flex-col min-h-0 bg-[var(--panel)] border border-[var(--border-color)] rounded-2xl flex-shrink-0">
        <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Context Inspector</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
          <div className="mb-3 opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
              <path d="M9 17v-4" />
              <path d="M15 17v-6" />
              <path d="M12 17v-8" />
            </svg>
          </div>
          <div className="text-sm">Context snapshots will appear here.</div>
        </div>
        <ChaosDebugPanel />
      </div>
    );
  }

  const currentSnapshot = activeHistory.snapshots[activeHistory.currentIndex];

  return (
    <div className="flex flex-col min-h-0 bg-[var(--panel)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
      <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] flex justify-between items-center">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Context Inspector
        </h2>
        <span className="text-[10px] font-mono text-gray-500 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded">
          {new Date(currentSnapshot.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <ContextHistoryControls 
        contextId={activeHistory.contextId}
        currentIndex={activeHistory.currentIndex}
        totalSnapshots={activeHistory.snapshots.length}
      />

      <div className="flex-1 overflow-auto relative pr-2 pb-2">
        <DiffSummary diff={diffResult} />

        <div className="bg-[#0B1220] p-4 rounded-xl border border-[var(--border-color)]">
          <ContextTree 
            data={currentSnapshot.data} 
            diff={diffResult} 
          />
        </div>
      </div>
      
      {/* Docked Chaos Panel */}
      <ChaosDebugPanel />
    </div>
  );
}
