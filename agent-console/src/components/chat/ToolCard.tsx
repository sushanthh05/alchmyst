'use client';

import { useEffect } from 'react';
import { ToolBlock as ToolBlockType } from '../../store/agentStore';
import { toolAckManager } from '../../lib/protocol/ToolAckManager';

export function ToolCard({ block }: { block: ToolBlockType }) {
  useEffect(() => {
    // Critical: Acknowledge the tool call as soon as the component renders/becomes visible
    toolAckManager.acknowledge(block.callId);
  }, [block.callId]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-md my-3 font-mono text-sm">
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
