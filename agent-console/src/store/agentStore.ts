import { create } from 'zustand';
import { ConnectionState } from '../lib/websocket/ConnectionState';

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

export interface TimelineEvent {
  id: string;
  seq: number;
  type: string;
  timestamp: number;
  content?: string;
  relatedId?: string;
  tokenCount?: number;
  durationMs?: number;
}

export interface ContextSnapshot {
  id: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ContextHistory {
  contextId: string;
  snapshots: ContextSnapshot[];
  currentIndex: number;
}

export interface DebugMetrics {
  highestProcessedSeq: number;
  bufferedMessagesCount: number;
  processedMessagesCount: number;
  duplicateMessagesDropped: number;
  outOfOrderMessagesBuffered: number;
  reconnectCount: number;
}

interface AgentState {
  messages: Message[];
  contexts: ContextHistory[];
  activeContextId: string | null;
  connectionState: ConnectionState;
  
  timelineEvents: TimelineEvent[];
  timelineFilter: string;
  timelineSearch: string;

  createStream: (streamId: string) => void;
  appendToken: (streamId: string, text: string) => void;
  addToolCall: (toolCall: { streamId: string; callId: string; toolName: string; args: Record<string, unknown> }) => void;
  completeToolCall: (callId: string, result: Record<string, unknown>) => void;
  completeStream: (streamId: string) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  setTimelineFilter: (filter: string) => void;
  setTimelineSearch: (search: string) => void;
  addContextSnapshot: (contextId: string, data: Record<string, unknown>) => void;
  setContextIndex: (contextId: string, index: number) => void;
  setActiveContextId: (contextId: string | null) => void;
  setConnectionState: (state: ConnectionState) => void;
  reset: () => void;
  
  debugMetrics: DebugMetrics;
  updateDebugMetrics: (metrics: Partial<DebugMetrics>) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  contexts: [],
  activeContextId: null,
  connectionState: 'DISCONNECTED',
  timelineEvents: [],
  timelineFilter: 'All',
  timelineSearch: '',
  debugMetrics: {
    highestProcessedSeq: 0,
    bufferedMessagesCount: 0,
    processedMessagesCount: 0,
    duplicateMessagesDropped: 0,
    outOfOrderMessagesBuffered: 0,
    reconnectCount: 0,
  },

  updateDebugMetrics: (metrics) => set((state) => ({
    debugMetrics: { ...state.debugMetrics, ...metrics }
  })),

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

  addTimelineEvent: (event) => set((state) => ({
    timelineEvents: [...state.timelineEvents, event]
  })),

  setTimelineFilter: (timelineFilter) => set({ timelineFilter }),
  setTimelineSearch: (timelineSearch) => set({ timelineSearch }),

  addContextSnapshot: (contextId, data) => set((state) => {
    const contexts = [...state.contexts];
    let ctxIndex = contexts.findIndex(c => c.contextId === contextId);
    
    const snapshot: ContextSnapshot = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      data,
    };

    if (ctxIndex === -1) {
      contexts.push({
        contextId,
        snapshots: [snapshot],
        currentIndex: 0,
      });
    } else {
      const history = { ...contexts[ctxIndex] };
      history.snapshots = [...history.snapshots, snapshot];
      history.currentIndex = history.snapshots.length - 1; // Auto-advance to newest
      contexts[ctxIndex] = history;
    }

    return { 
      contexts,
      // Automatically make it the active context if it's new or updated
      activeContextId: contextId 
    };
  }),

  setContextIndex: (contextId, index) => set((state) => {
    const contexts = [...state.contexts];
    const ctxIndex = contexts.findIndex(c => c.contextId === contextId);
    
    if (ctxIndex !== -1) {
      const history = { ...contexts[ctxIndex] };
      if (index >= 0 && index < history.snapshots.length) {
        history.currentIndex = index;
        contexts[ctxIndex] = history;
      }
    }
    
    return { contexts };
  }),

  setActiveContextId: (activeContextId) => set({ activeContextId }),

  reset: () => set({ 
    messages: [], 
    contexts: [], 
    activeContextId: null,
    connectionState: 'DISCONNECTED',
    timelineEvents: []
  }),
}));
