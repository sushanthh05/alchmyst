'use client';

import { DiffResult } from '../../lib/context/diff';

export function DiffSummary({ diff }: { diff: DiffResult | null }) {
  if (!diff) return null;

  const totalChanges = diff.added.length + diff.removed.length + diff.changed.length;

  if (totalChanges === 0) {
    return (
      <div className="sticky top-0 z-10 text-xs text-gray-500 mb-4 px-3 py-2 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-lg backdrop-blur-md">
        No changes detected from previous snapshot.
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 mb-4 text-xs font-mono border border-[var(--border-color)] rounded-lg overflow-hidden bg-[#0A0F1C]/90 backdrop-blur-md shadow-sm">
      <div className="bg-[rgba(255,255,255,0.02)] px-3 py-2 font-semibold text-gray-300 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-2">
        <span className="whitespace-nowrap uppercase tracking-wider text-[10px]">Diff Summary</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-normal">
          <span className="text-green-400">+{diff.added.length} Added</span>
          <span className="text-red-400">-{diff.removed.length} Removed</span>
          <span className="text-yellow-500">~{diff.changed.length} Changed</span>
        </div>
      </div>
    </div>
  );
}
