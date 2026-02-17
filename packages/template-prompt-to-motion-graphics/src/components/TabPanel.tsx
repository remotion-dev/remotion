"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Code, Play } from "lucide-react";

export type TabId = "code" | "preview";

interface TabPanelProps {
  codeContent: React.ReactNode;
  previewContent: React.ReactNode;
  defaultTab?: TabId;
}

export function TabPanel({
  codeContent,
  previewContent,
  defaultTab = "preview",
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const tabs = [
    { id: "code" as const, label: "Remotion Code", icon: Code },
    { id: "preview" as const, label: "Video Preview", icon: Play },
  ];

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="inline-flex w-fit mb-4 shrink-0 rounded-lg overflow-hidden border border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              index > 0 && "border-l border-border",
              activeTab === tab.id
                ? "bg-accent text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === "code" ? codeContent : previewContent}
      </div>
    </div>
  );
}
