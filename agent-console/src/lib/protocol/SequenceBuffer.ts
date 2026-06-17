import { ServerMessage } from './types';
import { useAgentStore } from '../../store/agentStore';

export class SequenceBuffer {
  private buffer: Map<number, ServerMessage> = new Map();
  private expectedSeq: number = 0;

  public reset(): void {
    this.buffer.clear();
    this.expectedSeq = 0;
  }

  public push(event: ServerMessage): ServerMessage[] {
    // Dynamically adjust if the server starts at 1
    if (this.expectedSeq === 0 && event.seq === 1 && !this.buffer.has(0)) {
       this.expectedSeq = 1;
    }

    // Passthrough deduplicated events to let EventProcessor explicitly log them
    if (event.seq < this.expectedSeq) {
      console.log(`[REPLAY_EVENT] Passed through deduped seq=${event.seq}`);
      return [event];
    }

    // Buffer the event
    console.log(`[SEQ_BUFFERED] seq=${event.seq} (expected=${this.expectedSeq})`);
    this.buffer.set(event.seq, event);

    const store = useAgentStore.getState();
    store.updateDebugMetrics({
      bufferedMessagesCount: this.buffer.size,
      outOfOrderMessagesBuffered: store.debugMetrics.outOfOrderMessagesBuffered + 1
    });

    // Drain ready events
    const readyEvents: ServerMessage[] = [];
    while (this.buffer.has(this.expectedSeq)) {
      const e = this.buffer.get(this.expectedSeq)!;
      console.log(`[SEQ_RELEASED] seq=${this.expectedSeq} (${e.type})`);
      readyEvents.push(e);
      this.buffer.delete(this.expectedSeq);
      this.expectedSeq++;
    }

    if (readyEvents.length > 0) {
      useAgentStore.getState().updateDebugMetrics({
        bufferedMessagesCount: this.buffer.size
      });
    }

    return readyEvents;
  }
}
