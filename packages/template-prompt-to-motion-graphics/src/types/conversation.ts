export interface EditOperation {
  description: string;
  old_string: string;
  new_string: string;
  lineNumber?: number;
}

export interface AssistantMetadata {
  /** Which skills were detected for this generation */
  skills?: string[];
  /** Whether this was a tool-based edit or full replacement */
  editType?: "tool_edit" | "full_replacement";
  /** The edit operations applied (if tool_edit) */
  edits?: EditOperation[];
  /** Model used for generation */
  model?: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: number;
  /** For user messages, store attached images as base64 data URLs */
  attachedImages?: string[];
  /** For assistant messages, store the code snapshot at time of generation */
  codeSnapshot?: string;
  /** For assistant messages, store metadata about the generation */
  metadata?: AssistantMetadata;
  /** For error messages, store the error type */
  errorType?: "edit_failed" | "api" | "validation";
  /** For edit_failed errors, store the failed edit operation */
  failedEdit?: EditOperation;
}

export interface ConversationState {
  messages: ConversationMessage[];
  /** Track if the current code has been manually edited since last generation */
  hasManualEdits: boolean;
  /** Timestamp of last AI generation - compare with code changes to detect manual edits */
  lastGenerationTimestamp: number | null;
  /** Pending assistant message shown during generation */
  pendingMessage?: {
    skills?: string[];
    startedAt: number;
  };
}

export interface ConversationContextMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ErrorCorrectionContext {
  /** The compilation error message */
  error: string;
  /** Number of correction attempts so far */
  attemptNumber: number;
  /** Maximum correction attempts allowed */
  maxAttempts: number;
  /** The edit operation that failed (for edit_failed errors) */
  failedEdit?: EditOperation;
}
