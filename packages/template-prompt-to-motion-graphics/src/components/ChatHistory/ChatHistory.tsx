"use client";

import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConversationMessage } from "@/types/conversation";

interface ChatHistoryProps {
  messages: ConversationMessage[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClear: () => void;
  hasManualEdits: boolean;
}

export function ChatHistory({
  messages,
  isCollapsed,
  onToggleCollapse,
  onClear,
  hasManualEdits,
}: ChatHistoryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-background-elevated border-r border-border transition-all duration-300 shrink-0",
        isCollapsed ? "w-12" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                History
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          className={cn(isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Messages */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {hasManualEdits && (
            <div className="text-xs text-muted-foreground-dim bg-accent rounded px-2 py-1 flex items-center gap-1">
              <Pencil className="w-3 h-3" />
              Code has been manually edited
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const metadata = message.metadata;

  // User messages - simple display
  if (isUser) {
    return (
      <div className="rounded-lg p-2 text-sm bg-primary/10 text-foreground">
        <div className="text-xs text-muted-foreground-dim mb-1">You</div>
        <div className="line-clamp-3">{message.content}</div>
        <div className="text-xs text-muted-foreground-dim mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  // Error messages - show the error with retry hint
  if (isError) {
    return (
      <div className="rounded-lg p-2 text-sm bg-red-500/10 border border-red-500/20 text-foreground space-y-1">
        <div className="flex items-center gap-1.5 text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="font-medium text-xs">Edit Failed</span>
        </div>
        <div className="text-xs text-red-300/80">{message.content}</div>
        <div className="text-[10px] text-muted-foreground-dim pt-1">
          Try rephrasing your request or be more specific
        </div>
      </div>
    );
  }

  // Assistant messages - Claude Code style with details
  return (
    <div className="rounded-lg p-2 text-sm bg-secondary text-secondary-foreground space-y-2">
      {/* Summary as main content */}
      <div className="font-medium text-foreground">{message.content}</div>

      {/* Edit details - Claude Code style with line numbers */}
      {metadata?.editType === "tool_edit" && metadata.edits && (
        <div className="space-y-1 border-l-2 border-green-500/30 pl-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground-dim font-medium">
            Changes
          </div>
          {metadata.edits.map((edit, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
              <span className="flex-1">{edit.description}</span>
              {edit.lineNumber && (
                <span className="text-[10px] text-muted-foreground-dim font-mono">
                  L{edit.lineNumber}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full replacement indicator */}
      {metadata?.editType === "full_replacement" && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l-2 border-blue-500/30 pl-2">
          <FileCode className="w-3 h-3 text-blue-500" />
          <span>Full code rewrite</span>
        </div>
      )}

      {/* Used Skills section */}
      {metadata?.skills && metadata.skills.length > 0 && (
        <div className="border-l-2 border-purple-500/30 pl-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground-dim font-medium mb-1">
            Used Skills
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {metadata.skills.map((skill) => (
              <span
                key={skill}
                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-[10px] text-muted-foreground-dim pt-1 border-t border-border/30">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
