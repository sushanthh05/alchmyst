'use client';

import { Message } from '../../store/agentStore';
import { TextBlock } from './TextBlock';
import { ToolCard } from './ToolCard';

export function MessageView({ message }: { message: Message }) {
  return (
    <div className="group">
      <div className="text-[10px] text-gray-600 mb-2 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Stream: {message.streamId}
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
