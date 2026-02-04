"use client";

import { useRef, useEffect } from "react";
import { AlertTriangle, FileCode, PenLine, BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConversationMessage } from "@/types/conversation";

interface ChatHistoryProps {
  messages: ConversationMessage[];
  pendingMessage?: {
    skills?: string[];
    startedAt: number;
  };
}

export function ChatHistory({
  messages,
  pendingMessage,
}: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {pendingMessage && <PendingMessage skills={pendingMessage.skills} />}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const metadata = message.metadata;

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">You</span>
          <span className="text-xs text-muted-foreground-dim">{time}</span>
        </div>
        <div className="text-sm text-foreground leading-relaxed bg-secondary/50 rounded-lg px-3 py-2">
          {message.content}
          {message.attachedImages && message.attachedImages.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {message.attachedImages.map((img, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={img}
                  alt={`Attached ${index + 1}`}
                  className="h-20 w-auto rounded border border-border object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    const errorLabel =
      message.errorType === "api"
        ? "API Error"
        : message.errorType === "validation"
          ? "Validation Error"
          : "Edit Failed";

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">{errorLabel}</span>
        </div>
        <div className="text-xs text-red-300/80 leading-relaxed pl-6">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-400">Assistant</span>
        <span className="text-xs text-muted-foreground-dim">{time}</span>
      </div>

      <div className="text-sm text-foreground leading-relaxed">
        {message.content}
        {metadata?.skills && metadata.skills.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1.5 align-middle cursor-help">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={4}>
              Skills used: {metadata.skills.join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {metadata?.editType === "tool_edit" && metadata.edits && (
        <div className="space-y-1.5 pl-1 mt-2">
          {metadata.edits.map((edit, i) => (
            <div key={i} className="flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0 leading-none">
                <span className="text-xs text-muted-foreground">
                  {edit.description}
                </span>
                {edit.lineNumber && (
                  <span className="text-[10px] text-muted-foreground-dim font-mono ml-2">
                    L{edit.lineNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {metadata?.editType === "full_replacement" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode className="w-3.5 h-3.5" />
          <span className="text-xs">Full code rewrite</span>
        </div>
      )}
    </div>
  );
}

function PendingMessage({ skills }: { skills?: string[] }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-400">Assistant</span>
        <span className="text-xs text-muted-foreground-dim">now</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-3 h-3 border-2 border-muted-foreground border-t-blue-400 rounded-full animate-spin" />
        <span>Generating...</span>
        {skills && skills.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex align-middle cursor-help">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={4}>
              Skills used: {skills.join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
