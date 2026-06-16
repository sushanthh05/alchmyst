'use client';

import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function DebugPage() {
  const { connected, lastEvent, totalEvents, lastSeq, recentEvents, sendUserMessage } = useWebSocket();
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && connected) {
      sendUserMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <main className="p-8 font-sans max-w-2xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6">Protocol Debugger</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="border border-gray-300 p-2 flex-grow rounded text-black"
          placeholder="Enter message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!connected}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleSend}
          disabled={!connected}
        >
          Send
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <span className="font-semibold block">Connection:</span>
          <span className={connected ? 'text-green-600' : 'text-red-600'}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold block">Total Events:</span>
          <span className="font-mono">{totalEvents}</span>
        </div>

        <div>
          <span className="font-semibold block">Last Seq:</span>
          <span className="font-mono">{lastSeq !== null ? lastSeq : 'None'}</span>
        </div>

        <div>
          <span className="font-semibold block">Last Event:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded inline-block mt-1">
            {lastEvent || 'None'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold block mb-2">Recent Events:</span>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm min-h-[8rem] max-h-64 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <span className="text-gray-400">No events yet</span>
            ) : (
              recentEvents.map((event, index) => (
                <div key={index}>
                  {event.type} #{event.seq}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
