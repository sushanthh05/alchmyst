'use client';

import { Message } from '../../store/agentStore';
import { TextBlock } from './TextBlock';
import { ToolCard } from './ToolCard';

export function MessageView({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className="group">
      <div className="text-[10px] text-gray-500 mb-2 font-mono uppercase tracking-wider flex items-center justify-between">
        <span className={`font-semibold text-xs ${isUser ? 'text-blue-400' : 'text-green-400'}`}>
          {isUser ? 'User:' : 'Agent:'}
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          Stream: {message.streamId}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {message.blocks.map(block => {
          if (block.type === 'text') {
            return <TextBlock key={block.id} content={block.content} />;
          } else if (block.type === 'tool') {
            return <ToolCard key={block.id} block={block} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
