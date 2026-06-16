import { ServerMessage, ClientMessage } from '../protocol/types';

type EventHandler = (event: ServerMessage) => void;
type StatusHandler = (connected: boolean) => void;

export class WebSocketManager {
  private url: string;
  private ws: WebSocket | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private connected: boolean = false;

  constructor(url: string = 'ws://localhost:4747/ws') {
    this.url = url;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log('[WS] Connecting...');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.setConnected(true);
    };

    this.ws.onmessage = (messageEvent) => {
      try {
        const data = JSON.parse(messageEvent.data as string) as ServerMessage;
        console.log(`[EVENT] ${data.type} seq=${data.seq}`);
        this.notifyHandlers(data);
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected');
      this.setConnected(false);
      this.ws = null;
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.setConnected(false);
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
    handler(this.connected);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private setConnected(status: boolean): void {
    if (this.connected !== status) {
      this.connected = status;
      this.statusHandlers.forEach((handler) => handler(status));
    }
  }

  private notifyHandlers(event: ServerMessage): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }
}

// Export a singleton instance
export const wsManager = new WebSocketManager();
