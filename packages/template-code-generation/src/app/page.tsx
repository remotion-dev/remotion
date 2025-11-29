"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { NextPage } from "next";
import { ExampleSelector } from "../components/ExampleSelector";
import { CodeEditor } from "../components/CodeEditor";
import { AnimationPlayer } from "../components/AnimationPlayer";
import { PromptInput } from "../components/PromptInput";
import { examples, RemotionExample } from "../templates";
import { useAnimationState } from "../hooks/useAnimationState";

const Home: NextPage = () => {
  const [selectedExample, setSelectedExample] =
    useState<RemotionExample | null>(examples[0] || null);
  const [durationInFrames, setDurationInFrames] = useState(
    examples[0]?.durationInFrames || 150,
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const { code, Component, error, isCompiling, setCode, compileCode } =
    useAnimationState(examples[0]?.code || "");

  // Debounce compilation
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isStreamingRef = useRef(isStreaming);
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;

    // Compile when streaming ends
    if (wasStreaming && !isStreaming) {
      compileCode(codeRef.current);
    }
  }, [isStreaming, compileCode]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip compilation while streaming - will compile when streaming ends
      if (isStreamingRef.current) {
        return;
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        compileCode(newCode);
      }, 500);
    },
    [setCode, compileCode],
  );

  const handleExampleSelect = useCallback(
    (example: RemotionExample) => {
      setSelectedExample(example);
      setCode(example.code);
      setDurationInFrames(example.durationInFrames);
      setFps(example.fps);

      // Immediately compile the example code
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      compileCode(example.code);
    },
    [setCode, compileCode],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <ExampleSelector
        selectedExampleId={selectedExample?.id || null}
        onSelectExample={handleExampleSelect}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center px-6 py-3 bg-[#0f0f0f] border-b border-[#2a2a2a]">
          <div className="text-xl font-bold text-white font-sans">
            Remotion Playground
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#888] font-sans">
                Duration (frames):
              </span>
              <input
                type="number"
                min={1}
                max={1000}
                value={durationInFrames}
                onChange={(e) =>
                  setDurationInFrames(
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className="w-20 px-3 py-1.5 rounded border border-[#333] bg-[#1a1a1a] text-white text-sm font-sans"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#888] font-sans">FPS:</span>
              <input
                type="number"
                min={1}
                max={60}
                value={fps}
                onChange={(e) =>
                  setFps(
                    Math.max(1, Math.min(60, parseInt(e.target.value) || 30)),
                  )
                }
                className="w-20 px-3 py-1.5 rounded border border-[#333] bg-[#1a1a1a] text-white text-sm font-sans"
              />
            </div>
            <button
              className="px-4 py-2 rounded border-none bg-indigo-500 text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-indigo-600"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
            >
              {isEditorOpen ? "Hide Editor" : "Show Editor"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <AnimationPlayer
            Component={Component}
            durationInFrames={durationInFrames}
            fps={fps}
            isCompiling={isCompiling}
            error={error}
          />

          {isEditorOpen && (
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              isStreaming={isStreaming}
            />
          )}
        </div>

        <PromptInput
          onCodeGenerated={handleCodeChange}
          onStreamingChange={setIsStreaming}
        />
      </div>
    </div>
  );
};

export default Home;
