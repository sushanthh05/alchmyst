import { create } from 'zustand';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface ToolBlock {
  id: string;
  type: 'tool';
  callId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'pending' | 'complete';
}

export type Block = TextBlock | ToolBlock;

export interface Message {
  id: string; // The streamId serves as the message ID
  streamId: string;
  status: 'streaming' | 'complete';
  blocks: Block[];
}

interface AgentState {
  messages: Message[];
  contexts: any[]; // To be expanded in a future phase
  connectionState: 'connected' | 'disconnected';

  createStream: (streamId: string) => void;
  appendToken: (streamId: string, text: string) => void;
  addToolCall: (toolCall: { streamId: string; callId: string; toolName: string; args: Record<string, unknown> }) => void;
  completeToolCall: (callId: string, result: Record<string, unknown>) => void;
  completeStream: (streamId: string) => void;
  setConnectionState: (state: 'connected' | 'disconnected') => void;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  contexts: [],
  connectionState: 'disconnected',

  createStream: (streamId) =>
    set((state) => {
      // Avoid duplicate streams
      if (state.messages.some((m) => m.streamId === streamId)) {
        return state;
      }
      return {
        messages: [
          ...state.messages,
          { id: streamId, streamId, status: 'streaming', blocks: [] },
        ],
      };
    }),

  appendToken: (streamId, text) =>
    set((state) => {
      const messages = [...state.messages];
      const msgIndex = messages.findIndex((m) => m.streamId === streamId);
      
      if (msgIndex === -1) return state;
      
      const msg = { ...messages[msgIndex] };
      const blocks = [...msg.blocks];
      
      if (blocks.length === 0 || blocks[blocks.length - 1].type !== 'text') {
        // Create new text block
        blocks.push({
          id: Math.random().toString(36).substring(7),
          type: 'text',
          content: text,
        });
      } else {
        // Append to existing text block
        const lastBlock = { ...blocks[blocks.length - 1] } as TextBlock;
        lastBlock.content += text;
        blocks[blocks.length - 1] = lastBlock;
      }
      
      msg.blocks = blocks;
      messages[msgIndex] = msg;
      return { messages };
    }),

  addToolCall: ({ streamId, callId, toolName, args }) =>
    set((state) => {
      const messages = [...state.messages];
      const msgIndex = messages.findIndex((m) => m.streamId === streamId);
      
      if (msgIndex === -1) return state;
      
      const msg = { ...messages[msgIndex] };
      msg.blocks = [
        ...msg.blocks,
        {
          id: callId,
          type: 'tool',
          callId,
          toolName,
          args,
          status: 'pending',
        },
      ];
      messages[msgIndex] = msg;
      return { messages };
    }),

  completeToolCall: (callId, result) =>
    set((state) => {
      const messages = [...state.messages];
      
      // Find the message containing this tool call
      let found = false;
      for (let i = 0; i < messages.length; i++) {
        const msg = { ...messages[i] };
        const blocks = [...msg.blocks];
        const blockIndex = blocks.findIndex((b) => b.type === 'tool' && b.callId === callId);
        
        if (blockIndex !== -1) {
          blocks[blockIndex] = {
            ...blocks[blockIndex],
            result,
            status: 'complete',
          } as ToolBlock;
          
          msg.blocks = blocks;
          messages[i] = msg;
          found = true;
          break;
        }
      }
      
      if (!found) return state;
      return { messages };
    }),

  completeStream: (streamId) =>
    set((state) => {
      const messages = [...state.messages];
      const msgIndex = messages.findIndex((m) => m.streamId === streamId);
      
      if (msgIndex === -1) return state;
      
      messages[msgIndex] = { ...messages[msgIndex], status: 'complete' };
      return { messages };
    }),

  setConnectionState: (connectionState) => set({ connectionState }),

  reset: () => set({ messages: [], contexts: [], connectionState: 'disconnected' }),
}));
