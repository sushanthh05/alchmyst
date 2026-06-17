'use client';

import { useMemo } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { diffObjects } from '../../lib/context/diff';
import { ContextTree } from './ContextTree';
import { ContextHistoryControls } from './ContextHistoryControls';
import { DiffSummary } from './DiffSummary';

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
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex-shrink-0 items-center justify-center">
        <div className="text-gray-400 italic">Waiting for context...</div>
      </div>
    );
  }

  const currentSnapshot = activeHistory.snapshots[activeHistory.currentIndex];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex-shrink-0 shadow-sm relative">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold truncate pr-4 text-gray-800 dark:text-gray-100">
          {activeHistory.contextId}
        </h2>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {new Date(currentSnapshot.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <ContextHistoryControls 
        contextId={activeHistory.contextId}
        currentIndex={activeHistory.currentIndex}
        totalSnapshots={activeHistory.snapshots.length}
      />

      <div className="flex-1 overflow-y-auto relative pr-2 pb-2">
        <DiffSummary diff={diffResult} />

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
          <ContextTree 
            data={currentSnapshot.data} 
            diff={diffResult} 
          />
        </div>
      </div>
    </div>
  );
}
