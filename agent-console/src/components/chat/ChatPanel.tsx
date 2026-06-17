'use client';

import { useAgentStore } from '../../store/agentStore';
import { MessageView } from './MessageView';

export function ChatPanel() {
  const messages = useAgentStore((state) => state.messages);

  return (
    <div className="flex-1 flex flex-col p-6 pr-4 space-y-6">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="mb-3 opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="text-sm">Start a conversation with the agent.</div>
        </div>
      ) : (
        messages.map((msg) => <MessageView key={msg.id} message={msg} />)
      )}
    </div>
  );
}
