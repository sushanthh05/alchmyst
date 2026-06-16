export interface BaseServerMessage {
  type: string;
  seq: number;
}

export interface TokenMessage extends BaseServerMessage {
  type: 'TOKEN';
  text: string;
}

export interface ToolCallMessage extends BaseServerMessage {
  type: 'TOOL_CALL';
  toolName: string;
  args: unknown;
}

export interface ToolResultMessage extends BaseServerMessage {
  type: 'TOOL_RESULT';
  toolName: string;
  result: unknown;
}

export interface ContextSnapshotMessage extends BaseServerMessage {
  type: 'CONTEXT_SNAPSHOT';
  contextId: string;
  snapshot: unknown;
}

export interface PingMessage extends BaseServerMessage {
  type: 'PING';
  challenge: string;
}

export interface StreamEndMessage extends BaseServerMessage {
  type: 'STREAM_END';
}

export interface ErrorMessage extends BaseServerMessage {
  type: 'ERROR';
  error: string;
}

export type ServerMessage =
  | TokenMessage
  | ToolCallMessage
  | ToolResultMessage
  | ContextSnapshotMessage
  | PingMessage
  | StreamEndMessage
  | ErrorMessage;

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
  toolName: string;
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
