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
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Search timeline content..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.2)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-blue-500/50 transition-colors text-gray-200 placeholder-gray-500"
      />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-mono tracking-wide transition-colors border ${
              filter === opt
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-[#050816] text-gray-400 border-[var(--border-color)] hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
