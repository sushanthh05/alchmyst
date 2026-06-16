import { ServerMessage } from './types';

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

    // Deduplicate: if we already processed it, ignore.
    if (event.seq < this.expectedSeq) {
      return [];
    }

    // Buffer the event
    this.buffer.set(event.seq, event);

    // Drain ready events
    const readyEvents: ServerMessage[] = [];
    while (this.buffer.has(this.expectedSeq)) {
      readyEvents.push(this.buffer.get(this.expectedSeq)!);
      this.buffer.delete(this.expectedSeq);
      this.expectedSeq++;
    }

    return readyEvents;
  }
}
