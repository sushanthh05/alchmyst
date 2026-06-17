'use client';

import { DiffResult } from '../../lib/context/diff';

export function DiffSummary({ diff }: { diff: DiffResult | null }) {
  if (!diff) return null;

  const totalChanges = diff.added.length + diff.removed.length + diff.changed.length;

  if (totalChanges === 0) {
    return (
      <div className="text-sm text-gray-500 mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        No changes detected from previous snapshot.
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 mb-4 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span>Diff Summary</span>
        <div className="flex gap-3 text-xs font-normal">
          <span className="text-green-600 dark:text-green-400">+{diff.added.length} added</span>
          <span className="text-red-600 dark:text-red-400">-{diff.removed.length} removed</span>
          <span className="text-yellow-600 dark:text-yellow-500">~{diff.changed.length} changed</span>
        </div>
      </div>
      <div className="p-2 space-y-1 max-h-32 overflow-y-auto bg-white dark:bg-gray-900">
        {diff.added.map(path => (
          <div key={`add-${path}`} className="text-green-600 dark:text-green-400">
            <span className="font-bold mr-2">+</span> {path}
          </div>
        ))}
        {diff.removed.map(path => (
          <div key={`rem-${path}`} className="text-red-600 dark:text-red-400">
            <span className="font-bold mr-2">-</span> {path}
          </div>
        ))}
        {diff.changed.map(path => (
          <div key={`chg-${path}`} className="text-yellow-600 dark:text-yellow-500">
            <span className="font-bold mr-2">~</span> {path}
          </div>
        ))}
      </div>
    </div>
  );
}
