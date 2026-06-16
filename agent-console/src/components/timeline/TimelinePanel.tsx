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

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const filteredEvents = events.filter(evt => {
    // 1. Filter by Type
    if (filter !== 'All' && evt.type !== filter) {
      return false;
    }
    // 2. Filter by Search
    if (search.trim()) {
      const s = search.toLowerCase();
      const contentMatch = evt.content?.toLowerCase().includes(s);
      const typeMatch = evt.type.toLowerCase().includes(s);
      const relatedMatch = evt.relatedId?.toLowerCase().includes(s);
      if (!contentMatch && !typeMatch && !relatedMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Trace Timeline</h2>
      
      <TimelineFilters />

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-1 scroll-smooth"
      >
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400 italic mt-10 text-sm">
            No events found.
          </div>
        ) : (
          filteredEvents.map(evt => <TimelineRow key={evt.id} event={evt} />)
        )}
      </div>
    </div>
  );
}
