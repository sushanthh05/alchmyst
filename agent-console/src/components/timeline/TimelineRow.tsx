import { useEffect, useRef } from 'react';
import { TimelineEvent } from '../../store/agentStore';
import { useSelectionStore } from '../../store/selectionStore';

export function TimelineRow({ event }: { event: TimelineEvent }) {
  const select = useSelectionStore((state) => state.select);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const selectedSource = useSelectionStore((state) => state.selectedSource);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && selectedId === event.relatedId && selectedSource === 'chat') {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId, selectedSource, event.relatedId]);

  const isSelected = selectedId && selectedId === event.relatedId;
  const isClickable = event.type === 'TOOL_CALL' || event.type === 'TOOL_RESULT';

  const handleClick = () => {
    if (isClickable && event.relatedId) {
      select(event.relatedId, 'timeline');
    }
  };
  const timeStr = new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const msStr = event.timestamp.toString().slice(-3);

  let typeColor = 'text-gray-500';
  if (event.type === 'TOKEN_GROUP') typeColor = 'text-green-600 dark:text-green-400';
  else if (event.type === 'TOOL_CALL') typeColor = 'text-blue-600 dark:text-blue-400';
  else if (event.type === 'TOOL_RESULT') typeColor = 'text-purple-600 dark:text-purple-400';
  else if (event.type === 'ERROR') typeColor = 'text-red-600 dark:text-red-400';
  else if (event.type === 'CONTEXT_SNAPSHOT') typeColor = 'text-amber-600 dark:text-amber-400';

  return (
    <div 
      ref={ref}
      onClick={handleClick}
      className={`flex flex-col p-3 mb-2 border rounded shadow-sm text-sm font-mono transition-all ${
        isClickable ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700' : ''
      } ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-50' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-2 items-center">
          <span className={`font-bold ${typeColor}`}>{event.type}</span>
          <span className="text-gray-400 text-xs">#{event.seq}</span>
        </div>
        <div className="text-gray-400 text-xs">
          {timeStr}.{msStr}
        </div>
      </div>

      <div className="text-gray-700 dark:text-gray-300">
        {event.type === 'TOKEN_GROUP' && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">
              {event.tokenCount} tokens {event.durationMs ? `(${event.durationMs}ms)` : ''}
            </span>
            <div className="line-clamp-2 italic opacity-80">{event.content}</div>
          </div>
        )}
        
        {event.type === 'TOOL_CALL' && (
          <div className="font-semibold">{event.content} <span className="font-normal text-xs text-gray-400">({event.relatedId})</span></div>
        )}

        {event.type === 'TOOL_RESULT' && (
          <div className="font-semibold">{event.content}</div>
        )}

        {event.type === 'CONTEXT_SNAPSHOT' && (
          <div className="italic text-xs">Loaded {event.relatedId || 'context'}</div>
        )}
        
        {event.type === 'PING' && (
          <div className="italic text-xs opacity-50">Heartbeat</div>
        )}

        {event.type === 'STREAM_END' && (
          <div className="italic text-xs opacity-50">Stream closed</div>
        )}

        {event.type === 'ERROR' && (
          <div className="text-red-500">{event.content}</div>
        )}
      </div>
    </div>
  );
}
