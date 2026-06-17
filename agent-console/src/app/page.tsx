'use client';

import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChatPanel } from '../components/chat/ChatPanel';
import { TimelinePanel } from '../components/timeline/TimelinePanel';
import { ContextPanel } from '../components/context/ContextPanel';

export default function DebugPage() {
  const { connected, lastEvent, totalEvents, lastSeq, sendUserMessage } = useWebSocket();
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && connected) {
      sendUserMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <main className="p-8 font-sans max-w-6xl mx-auto text-gray-900 dark:text-gray-100 flex flex-col md:flex-row gap-8 h-screen max-h-screen">
      
      {/* Left side: Chat Panel */}
      <div className="flex-[2] flex flex-col min-h-0">
        <h1 className="text-2xl font-bold mb-6 flex-shrink-0">Agent Console</h1>
        
        <ChatPanel />

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex-grow rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!connected}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50 transition-colors shadow-sm"
            onClick={handleSend}
            disabled={!connected}
          >
            Send
          </button>
        </div>
      </div>

      {/* Center: Timeline Panel */}
      <TimelinePanel />

      {/* Right side: Context Panel */}
      <ContextPanel />
    </main>
  );
}
