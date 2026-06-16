import { ServerMessage } from './types';
import { useAgentStore } from '../../store/agentStore';

export class TimelineBridge {
  private currentTokenGroup: {
    seqStart: number;
    text: string;
    tokenCount: number;
    startTime: number;
  } | null = null;

  public handleEvent(event: ServerMessage): void {
    if (event.type === 'TOKEN') {
      this.handleToken(event);
    } else {
      // If it's a non-token event, flush any pending token group first
      this.flushTokenGroup();
      this.handleNonToken(event);
    }
  }

  private handleToken(event: import('./types').TokenMessage): void {
    if (!this.currentTokenGroup) {
      // Start a new token group
      this.currentTokenGroup = {
        seqStart: event.seq,
        text: event.text,
        tokenCount: 1,
        startTime: Date.now(),
      };
    } else {
      // Append to existing group
      this.currentTokenGroup.text += event.text;
      this.currentTokenGroup.tokenCount++;
    }
  }

  private handleNonToken(event: ServerMessage): void {
    const store = useAgentStore.getState();
    const timestamp = Date.now();

    let content: string | undefined = undefined;
    let relatedId: string | undefined = undefined;

    switch (event.type) {
      case 'TOOL_CALL':
        content = event.tool_name;
        relatedId = event.call_id;
        break;
      case 'TOOL_RESULT':
        content = `${event.call_id} completed`;
        relatedId = event.call_id;
        break;
      case 'ERROR':
        content = event.error;
        break;
    }

    const timelineEvent = {
      id: `te_${event.seq}_${Math.random().toString(36).substring(7)}`,
      seq: event.seq,
      type: event.type,
      timestamp,
      content,
      relatedId,
    };

    store.addTimelineEvent(timelineEvent);
    console.log(`[TIMELINE] ${event.type} added`);
  }

  public flushTokenGroup(): void {
    if (this.currentTokenGroup) {
      const store = useAgentStore.getState();
      const durationMs = Date.now() - this.currentTokenGroup.startTime;
      
      const timelineEvent = {
        id: `te_${this.currentTokenGroup.seqStart}_grp_${Math.random().toString(36).substring(7)}`,
        seq: this.currentTokenGroup.seqStart,
        type: 'TOKEN_GROUP',
        timestamp: this.currentTokenGroup.startTime,
        content: this.currentTokenGroup.text,
        tokenCount: this.currentTokenGroup.tokenCount,
        durationMs,
      };

      store.addTimelineEvent(timelineEvent);
      console.log(`[TIMELINE] TOKEN_GROUP flushed (${this.currentTokenGroup.tokenCount} tokens)`);

      this.currentTokenGroup = null;
    }
  }
}

export const timelineBridge = new TimelineBridge();
