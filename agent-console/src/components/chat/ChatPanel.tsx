'use client';

import { useAgentStore } from '../../store/agentStore';
import { MessageView } from './MessageView';

export function ChatPanel() {
  const messages = useAgentStore((state) => state.messages);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col h-full min-h-0">
      {messages.length === 0 ? (
        <div className="text-gray-500 italic text-center mt-10">
          No messages yet. Send a message to start streaming.
        </div>
      ) : (
        messages.map((msg) => <MessageView key={msg.id} message={msg} />)
      )}
    </div>
  );
}
