'use client';

import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChatPanel } from '../components/chat/ChatPanel';
import { TimelinePanel } from '../components/timeline/TimelinePanel';
import { ContextPanel } from '../components/context/ContextPanel';
import { ConnectionIndicator } from '../components/chat/ConnectionIndicator';
import { wsManager } from '../lib/websocket/WebSocketManager';

export default function DebugPage() {
  const { connectionState, sendUserMessage } = useWebSocket();
  const [inputValue, setInputValue] = useState('');

  const isConnected = connectionState === 'CONNECTED';

  const handleSend = () => {
    if (inputValue.trim() && isConnected) {
      sendUserMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <main className="h-screen max-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden w-full max-w-[1800px] mx-auto">
      
      {/* TOP BAR */}
      <header className="flex-shrink-0 h-14 border-b border-[var(--border-color)] bg-[var(--panel)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold tracking-wide">Agent Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionIndicator />
          {connectionState === 'DISCONNECTED' ? (
            <button
              onClick={() => wsManager.connect()}
              className="px-3 py-1 text-xs font-medium bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded transition-colors text-green-400 hover:text-green-300"
            >
              Connect WS
            </button>
          ) : (
            <button
              onClick={() => wsManager.disconnect()}
              className="px-3 py-1 text-xs font-medium bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[var(--border-color)] rounded transition-colors text-gray-300 hover:text-white"
            >
              Disconnect WS
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div 
        className="flex-1 min-h-0 p-6 grid gap-6"
        style={{ 
          gridTemplateColumns: '1.4fr 1.1fr 1.2fr',
        }}
      >
        {/* Left Column: Chat */}
        <div className="flex flex-col min-h-0 bg-[var(--panel)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Agent Stream</h2>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ChatPanel />
          </div>

          <div className="flex-shrink-0 p-4 border-t border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-[rgba(0,0,0,0.2)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-500"
                placeholder="Message the agent..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={!isConnected}
              />
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                onClick={handleSend}
                disabled={!isConnected}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Timeline */}
        <TimelinePanel />

        {/* Right Column: Context Inspector */}
        <ContextPanel />
      </div>
    </main>
  );
}
