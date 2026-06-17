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

  let badgeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  if (event.type === 'TOKEN_GROUP') badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
  else if (event.type === 'TOOL_CALL') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  else if (event.type === 'TOOL_RESULT') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  else if (event.type === 'CONTEXT_SNAPSHOT') badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  else if (event.type === 'STREAM_END') badgeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  else if (event.type === 'ERROR') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
  else if (event.type === 'PING') badgeColor = 'bg-transparent text-gray-600 border-transparent';

  return (
    <div 
      ref={ref}
      onClick={handleClick}
      className={`flex flex-col p-2.5 rounded-lg border text-sm font-mono transition-all ${
        isClickable ? 'cursor-pointer hover:border-gray-500 hover:bg-[#0D1425]' : ''
      } ${
        isSelected 
          ? 'border-blue-500/50 bg-[#0A0F1C] shadow-sm ring-1 ring-blue-500/50 shadow-blue-900/10' 
          : 'bg-[#050816] border-[var(--border-color)]'
      }`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex gap-2 items-center">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
            {event.type}
          </span>
          <span className="text-gray-500 text-[10px]">#{event.seq}</span>
        </div>
        <div className="text-gray-500 text-[10px]">
          {timeStr}.{msStr}
        </div>
      </div>

      <div className="text-gray-300 text-xs">
        {event.type === 'TOKEN_GROUP' && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500">
              {event.tokenCount} tokens {event.durationMs ? `(${event.durationMs}ms)` : ''}
            </span>
            <div className="line-clamp-2 text-gray-400">{event.content}</div>
          </div>
        )}
        
        {event.type === 'TOOL_CALL' && (
          <div className="font-semibold text-blue-300">{event.content} <span className="font-normal text-[10px] text-gray-500">({event.relatedId})</span></div>
        )}

        {event.type === 'TOOL_RESULT' && (
          <div className="font-semibold text-purple-300">{event.content}</div>
        )}

        {event.type === 'CONTEXT_SNAPSHOT' && (
          <div className="text-orange-300/80">Loaded {event.relatedId || 'context'}</div>
        )}
        
        {event.type === 'PING' && (
          <div className="text-gray-600">Heartbeat</div>
        )}

        {event.type === 'STREAM_END' && (
          <div className="text-gray-600">Stream closed</div>
        )}

        {event.type === 'ERROR' && (
          <div className="text-red-400">{event.content}</div>
        )}
      </div>
    </div>
  );
}
