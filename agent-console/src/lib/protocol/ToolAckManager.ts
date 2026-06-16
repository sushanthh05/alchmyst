import { wsManager } from '../websocket/WebSocketManager';

export class ToolAckManager {
  private ackedCalls = new Set<string>();

  public acknowledge(callId: string): void {
    if (this.ackedCalls.has(callId)) {
      return; // Prevent duplicates
    }

    console.log(`[TOOL_ACK_SENT] ${callId}`);
    this.ackedCalls.add(callId);
    
    // Send directly via WebSocketManager
    wsManager.send({ type: 'TOOL_ACK', call_id: callId });
  }
}

// Singleton export
export const toolAckManager = new ToolAckManager();
