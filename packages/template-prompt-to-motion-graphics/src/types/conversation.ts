export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** For assistant messages, store the code snapshot at time of generation */
  codeSnapshot?: string;
}

export interface ConversationState {
  messages: ConversationMessage[];
  /** Track if the current code has been manually edited since last generation */
  hasManualEdits: boolean;
  /** Timestamp of last AI generation - compare with code changes to detect manual edits */
  lastGenerationTimestamp: number | null;
}

export interface ConversationContextMessage {
  role: "user" | "assistant";
  content: string;
}
