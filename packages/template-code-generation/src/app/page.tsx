"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { CodeEditor } from "../components/CodeEditor";
import { AnimationPlayer } from "../components/AnimationPlayer";
import { PromptInput, type StreamPhase } from "../components/PromptInput";
import { SettingsModal } from "../components/SettingsModal";
import { examples } from "../templates";
import { useAnimationState } from "../hooks/useAnimationState";

const Home: NextPage = () => {
  const [durationInFrames, setDurationInFrames] = useState(
    examples[0]?.durationInFrames || 150,
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPhase, setStreamPhase] = useState<StreamPhase>("idle");

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
      <div className="flex-1 flex flex-col min-w-0 py-8 px-12 rounded-md gap-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Remotion" width={32} height={32} />
            <span className="text-xl font-bold text-white font-sans">
              Remotion Code Generation
            </span>
          </div>
          <SettingsModal
            durationInFrames={durationInFrames}
            onDurationChange={setDurationInFrames}
            fps={fps}
            onFpsChange={setFps}
          />
        </div>

        <div className="flex-1 flex overflow-hidden gap-8">
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            isStreaming={isStreaming}
            streamPhase={streamPhase}
          />
          <AnimationPlayer
            Component={Component}
            durationInFrames={durationInFrames}
            fps={fps}
            isCompiling={isCompiling}
            error={error}
          />
        </div>

        <PromptInput
          onCodeGenerated={handleCodeChange}
          onStreamingChange={setIsStreaming}
          onStreamPhaseChange={setStreamPhase}
        />
      </div>
    </div>
  );
};

export default Home;
