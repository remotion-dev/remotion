"use client";

import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
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

  return (
    <div
      className={cn(
        "rounded-lg p-2 text-sm",
        isUser
          ? "bg-primary/10 text-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      <div className="text-xs text-muted-foreground-dim mb-1">
        {isUser ? "You" : "AI"}
      </div>
      <div className="line-clamp-3">{message.content}</div>
      <div className="text-xs text-muted-foreground-dim mt-1">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
