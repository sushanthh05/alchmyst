import { ServerMessage, ClientMessage } from './types';
import { storeEventBridge } from './StoreEventBridge';
import { timelineBridge } from './TimelineBridge';

export class EventProcessor {
  constructor(
    private send: (msg: ClientMessage) => void,
    private onProcessed: (event: ServerMessage) => void
  ) {}

  public process(event: ServerMessage): void {
    try {
      // 1. Process critical protocol responses immediately (unblockable)
      if (event.type === 'PING') {
        console.log(`[PING_RECEIVED] #${event.seq}`);
        this.send({ type: 'PONG', echo: event.challenge ?? '' });
        console.log(`[PONG_SENT] for #${event.seq}`);
      } else if (event.type === 'TOOL_CALL') {
        console.log(`[TOOL_CALL_RECEIVED] ${event.call_id}`);
      }

      // 2. Pass the processed event up to the application (React) via callback
      this.onProcessed(event);
      
      // 3. Push into global state (this could fail if the payload is malformed, so it's safely in a try/catch)
      storeEventBridge.handleEvent(event);
      
      // 4. Pass to Timeline logic
      timelineBridge.handleEvent(event);
      
    } catch (error) {
      console.error(`[PROCESSOR] Error processing event ${event.type}:`, error);
    }
  }
}
