"use client";

import React, { useState } from "react";
import { examples, RemotionExample } from "../templates";

interface ExampleSelectorProps {
  selectedExampleId: string | null;
  onSelectExample: (example: RemotionExample) => void;
}

const getCategoryColor = (category: RemotionExample["category"]) => {
  switch (category) {
    case "Text":
      return { bg: "bg-blue-800", text: "text-blue-300" };
    case "Charts":
      return { bg: "bg-emerald-800", text: "text-emerald-300" };
    case "Other":
      return { bg: "bg-violet-800", text: "text-violet-300" };
  }
};

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  selectedExampleId,
  onSelectExample,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-80 h-full bg-[#0f0f0f] border-r border-[#2a2a2a] overflow-y-auto p-4">
      <h2 className="text-lg font-bold text-white mb-4 font-sans">Examples</h2>
      {examples.map((example) => {
        const isSelected = selectedExampleId === example.id;
        const isHovered = hoveredId === example.id;
        const colors = getCategoryColor(example.category);

        return (
          <div
            key={example.id}
            className={`
              rounded-lg p-4 mb-3 cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "border border-indigo-500 bg-[#1e1e2e]"
                  : isHovered
                    ? "border border-[#444] bg-[#1a1a1a]"
                    : "border border-transparent bg-[#1a1a1a]"
              }
            `}
            onClick={() => onSelectExample(example)}
            onMouseEnter={() => setHoveredId(example.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="text-base font-semibold text-white mb-1 font-sans">
              {example.name}
            </div>
            <div className="text-sm text-[#888] mb-2 font-sans">
              {example.description}
            </div>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded font-sans ${colors.bg} ${colors.text}`}
            >
              {example.category}
            </span>
          </div>
        );
      })}
    </div>
  );
};
