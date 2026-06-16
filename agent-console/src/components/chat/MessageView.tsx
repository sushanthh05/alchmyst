import { Message } from '../../store/agentStore';
import { TextBlock } from './TextBlock';
import { ToolCard } from './ToolCard';

export function MessageView({ message }: { message: Message }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
        Stream: {message.streamId}
      </div>
      <div className="flex flex-col space-y-1">
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
