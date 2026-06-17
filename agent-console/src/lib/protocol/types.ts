export interface BaseServerMessage {
  type: string;
  seq: number;
}

export interface TokenMessage extends BaseServerMessage {
  type: 'TOKEN';
  text: string;
  stream_id: string;
}

export interface ToolCallMessage extends BaseServerMessage {
  type: 'TOOL_CALL';
  call_id: string;
  tool_name: string;
  args: unknown;
  stream_id: string;
}

export interface ToolResultMessage extends BaseServerMessage {
  type: 'TOOL_RESULT';
  call_id: string;
  result: unknown;
  stream_id: string;
}

export interface ContextSnapshotMessage extends BaseServerMessage {
  type: 'CONTEXT_SNAPSHOT';
  context_id: string;
  data: unknown;
}

export interface PingMessage extends BaseServerMessage {
  type: 'PING';
  challenge: string;
}

export interface StreamEndMessage extends BaseServerMessage {
  type: 'STREAM_END';
  stream_id: string;
}

export interface ErrorMessage extends BaseServerMessage {
  type: 'ERROR';
  error: string;
}

export interface ReplayCompleteMessage extends BaseServerMessage {
  type: 'REPLAY_COMPLETE';
}

export type ServerMessage =
  | TokenMessage
  | ToolCallMessage
  | ToolResultMessage
  | ContextSnapshotMessage
  | PingMessage
  | StreamEndMessage
  | ErrorMessage
  | ReplayCompleteMessage;

export interface BaseClientMessage {
  type: string;
}

export interface UserMessage extends BaseClientMessage {
  type: 'USER_MESSAGE';
  content: string;
}

export interface PongMessage extends BaseClientMessage {
  type: 'PONG';
  echo: string;
}

export interface ToolAckMessage extends BaseClientMessage {
  type: 'TOOL_ACK';
  call_id: string;
}

export interface ResumeMessage extends BaseClientMessage {
  type: 'RESUME';
  last_seq: number;
}

export type ClientMessage =
  | UserMessage
  | PongMessage
  | ToolAckMessage
  | ResumeMessage;
