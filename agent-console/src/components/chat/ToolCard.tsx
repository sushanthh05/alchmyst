'use client';

import { useEffect, useRef } from 'react';
import { ToolBlock as ToolBlockType } from '../../store/agentStore';
import { useSelectionStore } from '../../store/selectionStore';

export function ToolCard({ block }: { block: ToolBlockType }) {
  const select = useSelectionStore((state) => state.select);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const selectedSource = useSelectionStore((state) => state.selectedSource);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId === block.callId && selectedSource === 'timeline') {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId, selectedSource, block.callId]);

  const isSelected = selectedId === block.callId;

  return (
    <div 
      ref={ref}
      onClick={() => select(block.callId, 'chat')}
      className={`p-4 rounded-xl shadow-sm transition-all cursor-pointer bg-[#0A0F1C] border ${
        isSelected 
          ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-blue-900/20' 
          : 'border-[var(--border-color)] hover:border-gray-600 hover:bg-[#0D1425]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-sm font-semibold text-blue-400 flex items-center gap-2">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          {block.toolName}
        </div>
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
          block.status === 'complete' 
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
        }`}>
          {block.status === 'complete' ? 'Executed' : 'Running...'}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">Arguments</div>
          <pre className="bg-[#050816] p-3 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 border border-[var(--border-color)]">
            {JSON.stringify(block.args, null, 2)}
          </pre>
        </div>
        
        {block.status === 'complete' && block.result && (
          <div>
            <div className="text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">Result</div>
            <pre className="bg-[#050816] p-3 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 border border-[var(--border-color)]">
              {JSON.stringify(block.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
