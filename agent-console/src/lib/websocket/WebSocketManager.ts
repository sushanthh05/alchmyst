import { ServerMessage, ClientMessage } from '../protocol/types';
import { useAgentStore } from '../../store/agentStore';
import { SequenceBuffer } from '../protocol/SequenceBuffer';
import { EventProcessor } from '../protocol/EventProcessor';
import { storeEventBridge } from '../protocol/StoreEventBridge';
import { ConnectionState } from './ConnectionState';
import { ReconnectionManager } from './ReconnectionManager';

type EventHandler = (event: ServerMessage) => void;
type StatusHandler = (state: ConnectionState) => void;

export class WebSocketManager {
  private url: string;
  private ws: WebSocket | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private connectionState: ConnectionState = 'DISCONNECTED';
  
  private seqBuffer: SequenceBuffer;
  private eventProcessor: EventProcessor;
  private reconnectionManager: ReconnectionManager;

  constructor(url: string = 'ws://localhost:4747/ws') {
    this.url = url;
    
    // Initialize protocol components
    this.seqBuffer = new SequenceBuffer();
    this.eventProcessor = new EventProcessor(
      (msg) => this.send(msg),
      (event) => this.notifyHandlers(event)
    );
    this.reconnectionManager = new ReconnectionManager();
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log('[WS] Connecting...');
    if (this.connectionState === 'DISCONNECTED') {
      this.setConnectionState('CONNECTING');
    }
    
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS_CONNECTED]');
      
      if (this.connectionState === 'RECONNECTING') {
        console.log('[RECONNECT_SUCCESS]');
        const store = useAgentStore.getState();
        store.updateDebugMetrics({
          reconnectCount: store.debugMetrics.reconnectCount + 1
        });
      }

      this.reconnectionManager.reset();
      
      const lastSeq = this.eventProcessor.getHighestProcessedSeq();
      
      if (lastSeq > 0) {
        this.setConnectionState('RESUMING');
        console.log(`[RESUME_SENT] last_seq=${lastSeq}`);
        this.send({ type: 'RESUME', last_seq: lastSeq } as ClientMessage);
        
        // The toy server does not send a REPLAY_COMPLETE event.
        // It immediately replays events in a tight loop. If it replays 0 events, 
        // we'd be stuck in RESUMING forever until the next PING.
        // Fallback timeout to clear RESUMING state.
        setTimeout(() => {
          if (this.connectionState === 'RESUMING') {
            this.setConnectionState('CONNECTED');
          }
        }, 500);
      } else {
        this.setConnectionState('CONNECTED');
      }
    };

    this.ws.onmessage = (messageEvent) => {
      try {
        const data = JSON.parse(messageEvent.data as string) as ServerMessage;
        
        if (data.seq !== undefined) {
          console.log(`[SEQ_RECEIVED] seq=${data.seq}`);
        }

        // Transition from RESUMING to CONNECTED on the very first message we receive post-reconnect
        if (this.connectionState === 'RESUMING') {
          this.setConnectionState('CONNECTED');
        }

        // PINGs must be responded to immediately, never buffer them
        if (data.type === 'PING') {
          this.eventProcessor.process(data, true);
          // DO NOT RETURN. We must push PING into SequenceBuffer to satisfy its sequence number,
          // otherwise SequenceBuffer gets deadlocked waiting for the PING's seq!
          // EventProcessor's deduplication will silently drop the duplicate when SequenceBuffer releases it.
        }

        if (data.type === 'REPLAY_COMPLETE') {
          this.setConnectionState('CONNECTED');
          this.eventProcessor.process(data);
          return;
        }

        // Pass through SequenceBuffer to get ordered and deduplicated events
        const readyEvents = this.seqBuffer.push(data);
        
        // Process each ready event
        for (const event of readyEvents) {
          this.eventProcessor.process(event, false);
        }
        
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS_DISCONNECTED]');
      this.ws = null;
      
      if (this.connectionState !== 'DISCONNECTED') {
        this.setConnectionState('RECONNECTING');
        console.log('[RECONNECT_START]');
        this.reconnectionManager.schedule(() => this.connect());
      }
    };

    this.ws.onerror = (error) => {
      // Intentionally omitting console.error to prevent console spam during normal reconnection backoff
    };
  }

  public disconnect(): void {
    this.setConnectionState('DISCONNECTED');
    this.reconnectionManager.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public debugDisconnect(): void {
    console.log('[DEBUG_DISCONNECT] Manual WebSocket disconnect');
    if (this.ws) {
      this.ws.close();
      // We don't set this.ws = null here so that the onclose handler can run normally
    }
  }

  public send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }

  public sendUserMessage(content: string): void {
    this.seqBuffer.reset();
    this.eventProcessor.reset();
    this.send({ type: 'USER_MESSAGE', content });
  }

  public onMessage(handler: EventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  public onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Immediately call with current status
    handler(this.connectionState);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private setConnectionState(newState: ConnectionState): void {
    if (this.connectionState !== newState) {
      console.log(`[STATE_CHANGE] ${this.connectionState} -> ${newState}`);
      this.connectionState = newState;
      this.statusHandlers.forEach((handler) => handler(newState));
      storeEventBridge.handleConnectionState(newState);
    }
  }

  private notifyHandlers(event: ServerMessage): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }
}

// Export a singleton instance
export const wsManager = new WebSocketManager();
