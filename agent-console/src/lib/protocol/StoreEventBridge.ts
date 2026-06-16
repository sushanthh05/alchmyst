import { useAgentStore } from '../../store/agentStore';
import { ServerMessage } from './types';

export class StoreEventBridge {
  public handleEvent(event: ServerMessage): void {
    const store = useAgentStore.getState();

    switch (event.type) {
      case 'TOKEN':
        // Ensure stream exists before appending token
        store.createStream(event.stream_id);
        store.appendToken(event.stream_id, event.text);
        break;

      case 'TOOL_CALL':
        store.createStream(event.stream_id);
        store.addToolCall({
          streamId: event.stream_id,
          callId: event.call_id,
          toolName: event.tool_name,
          args: event.args as Record<string, unknown>,
        });
        break;

      case 'TOOL_RESULT':
        // Tool results don't necessarily contain streamId in all implementations, 
        // but our types include it. Update the tool block:
        store.completeToolCall(event.call_id, event.result as Record<string, unknown>);
        break;

      case 'STREAM_END':
        store.completeStream(event.stream_id);
        break;

      // We can handle CONTEXT_SNAPSHOT here later
      default:
        break;
    }
  }

  public handleConnectionState(connected: boolean): void {
    const store = useAgentStore.getState();
    store.setConnectionState(connected ? 'connected' : 'disconnected');
  }
}

// Export a singleton
export const storeEventBridge = new StoreEventBridge();
