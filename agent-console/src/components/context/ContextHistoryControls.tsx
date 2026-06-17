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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] p-2 rounded-lg mb-4">
      <button
        onClick={() => setContextIndex(contextId, currentIndex - 1)}
        disabled={currentIndex === 0}
        className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--panel)] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--border-color)] hover:bg-[#0D1425] transition-colors"
      >
        &larr; Previous
      </button>
      
      <div className="text-xs font-medium text-gray-500 text-center uppercase tracking-wider">
        Snapshot {currentIndex + 1} of {totalSnapshots}
      </div>

      <button
        onClick={() => setContextIndex(contextId, currentIndex + 1)}
        disabled={currentIndex === totalSnapshots - 1}
        className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--panel)] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--border-color)] hover:bg-[#0D1425] transition-colors"
      >
        Next &rarr;
      </button>
    </div>
  );
}
