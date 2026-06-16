'use client';

import { useAgentStore } from '../../store/agentStore';

export function TimelineFilters() {
  const filter = useAgentStore((state) => state.timelineFilter);
  const search = useAgentStore((state) => state.timelineSearch);
  const setFilter = useAgentStore((state) => state.setTimelineFilter);
  const setSearch = useAgentStore((state) => state.setTimelineSearch);

  const filterOptions = [
    'All',
    'TOKEN_GROUP',
    'TOOL_CALL',
    'TOOL_RESULT',
    'CONTEXT_SNAPSHOT',
    'PING',
    'STREAM_END',
    'ERROR',
  ];

  return (
    <div className="flex flex-col gap-3 mb-4 shrink-0">
      <input
        type="text"
        placeholder="Search timeline content..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === opt
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
