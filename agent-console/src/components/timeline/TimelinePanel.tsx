'use client';

import { useEffect, useRef } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { TimelineFilters } from './TimelineFilters';
import { TimelineRow } from './TimelineRow';

export function TimelinePanel() {
  const events = useAgentStore((state) => state.timelineEvents);
  const filter = useAgentStore((state) => state.timelineFilter);
  const search = useAgentStore((state) => state.timelineSearch);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const filteredEvents = events.filter(evt => {
    if (filter !== 'All' && evt.type !== filter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const contentMatch = evt.content?.toLowerCase().includes(s);
      const typeMatch = evt.type.toLowerCase().includes(s);
      const relatedMatch = evt.relatedId?.toLowerCase().includes(s);
      if (!contentMatch && !typeMatch && !relatedMatch) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-0 bg-[var(--panel)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
      <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Trace Timeline</h2>
      </div>
      
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-[var(--border-color)]">
        <TimelineFilters />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2 scroll-smooth"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full">
            <div className="mb-3 opacity-30">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">No trace events yet.</div>
          </div>
        ) : (
          filteredEvents.map(evt => <TimelineRow key={evt.id} event={evt} />)
        )}
      </div>
    </div>
  );
}
