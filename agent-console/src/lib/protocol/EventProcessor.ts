import { ServerMessage, ClientMessage } from './types';
import { storeEventBridge } from './StoreEventBridge';
import { timelineBridge } from './TimelineBridge';
import { useAgentStore } from '../../store/agentStore';
import { toolAckManager } from './ToolAckManager';

export class EventProcessor {
  private highestProcessedSeq: number = 0;
  private processedSeqSet: Set<number> = new Set();

  constructor(
    private send: (msg: ClientMessage) => void,
    private onProcessed: (event: ServerMessage) => void
  ) {}

  public getHighestProcessedSeq(): number {
    return this.highestProcessedSeq;
  }

  public reset(): void {
    this.highestProcessedSeq = 0;
    this.processedSeqSet.clear();
  }

  public process(event: ServerMessage, isBypass: boolean = false): void {
    try {
      // 1. Process critical protocol responses immediately (unblockable & non-deduped)
      if (event.type === 'PING') {
        if (isBypass) {
          console.log(`[PING_RECEIVED] #${event.seq}`);
          this.send({ type: 'PONG', echo: event.challenge ?? '' });
          console.log(`[PONG_SENT] for #${event.seq}`);
          return; // Do not deduplicate or process further yet
        }
        // If it's not a bypass, it's being naturally released from SequenceBuffer.
        // We don't send PONG again. Let it fall through to update metrics and timeline!
      }

      // 0. Explicit Deduplication
      if (event.seq !== undefined && this.processedSeqSet.has(event.seq)) {
        console.log(`[DEDUPE] seq=${event.seq} ignored (${event.type})`);
        console.log(`[DUPLICATE_DROPPED] seq=${event.seq}`);
        const store = useAgentStore.getState();
        store.updateDebugMetrics({
          duplicateMessagesDropped: store.debugMetrics.duplicateMessagesDropped + 1
        });
        return;
      }

      console.log(`[PROCESS_EVENT] processing seq=${event.seq} type=${event.type}`);

      if (event.type === 'TOOL_CALL') {
        console.log(`[TOOL_CALL_RECEIVED] ${event.call_id}`);
        // Send protocol ACK immediately, before ANY UI rendering, Zustand updates, or callbacks
        toolAckManager.acknowledge(event.call_id);
      } else if (event.type === 'REPLAY_COMPLETE') {
        console.log(`[REPLAY_EVENT] REPLAY_COMPLETE received`);
        return; // Don't process this further
      } else if (event.type === 'STREAM_END') {
        console.log(`[STREAM_END_RECEIVED] seq=${event.seq}`);
      }

      // 2. Pass the processed event up to the application (React) via callback
      this.onProcessed(event);
      
      // 3. Push into global state (this could fail if the payload is malformed, so it's safely in a try/catch)
      storeEventBridge.handleEvent(event);
      
      // 4. Pass to Timeline logic
      timelineBridge.handleEvent(event);

      // 5. Update highest processed seq
      const store = useAgentStore.getState();
      if (event.seq !== undefined) {
        this.processedSeqSet.add(event.seq);
        this.highestProcessedSeq = Math.max(this.highestProcessedSeq, event.seq);
        console.log(`[SEQ_PROCESSED] seq=${event.seq}`);
      }
      
      store.updateDebugMetrics({
        highestProcessedSeq: this.highestProcessedSeq,
        processedMessagesCount: store.debugMetrics.processedMessagesCount + 1
      });
      
    } catch (error) {
      console.error(`[PROCESSOR] Error processing event ${event.type}:`, error);
    }
  }
}
