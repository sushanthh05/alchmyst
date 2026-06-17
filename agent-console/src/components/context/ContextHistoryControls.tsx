'use client';

import { useAgentStore } from '../../store/agentStore';

interface Props {
  contextId: string;
  currentIndex: number;
  totalSnapshots: number;
}

export function ContextHistoryControls({ contextId, currentIndex, totalSnapshots }: Props) {
  const setContextIndex = useAgentStore(state => state.setContextIndex);

  if (totalSnapshots <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-4">
      <button
        onClick={() => setContextIndex(contextId, currentIndex - 1)}
        disabled={currentIndex === 0}
        className="px-3 py-1 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        &larr; Previous
      </button>
      
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Snapshot {currentIndex + 1} of {totalSnapshots}
      </div>

      <button
        onClick={() => setContextIndex(contextId, currentIndex + 1)}
        disabled={currentIndex === totalSnapshots - 1}
        className="px-3 py-1 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        Next &rarr;
      </button>
    </div>
  );
}
