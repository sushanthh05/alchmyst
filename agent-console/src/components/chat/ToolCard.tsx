'use client';

import { useEffect, useRef } from 'react';
import { ToolBlock as ToolBlockType } from '../../store/agentStore';
import { useSelectionStore } from '../../store/selectionStore';
import { toolAckManager } from '../../lib/protocol/ToolAckManager';

export function ToolCard({ block }: { block: ToolBlockType }) {
  const select = useSelectionStore((state) => state.select);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const selectedSource = useSelectionStore((state) => state.selectedSource);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Acknowledge tool call immediately upon rendering
    toolAckManager.acknowledge(block.callId);
  }, [block.callId]);

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
      className={`p-4 border rounded-lg shadow-sm mb-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500 ring-opacity-50' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
        {block.toolName}
      </div>
      <div className="mb-2">
        <span className="opacity-75">Status: </span>
        <span className={block.status === 'complete' ? 'text-green-600 dark:text-green-400 font-semibold' : 'italic'}>
          {block.status === 'complete' ? 'Complete' : 'Waiting...'}
        </span>
      </div>
      <div className="mb-2">
        <span className="opacity-75 block mb-1">Args:</span>
        <pre className="bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto text-xs border border-gray-200 dark:border-gray-700">
          {JSON.stringify(block.args, null, 2)}
        </pre>
      </div>
      {block.status === 'complete' && block.result && (
        <div>
          <span className="opacity-75 block mb-1">Result:</span>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto text-xs border border-gray-200 dark:border-gray-700">
            {JSON.stringify(block.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
