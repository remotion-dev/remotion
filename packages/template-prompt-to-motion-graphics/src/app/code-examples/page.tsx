"use client";

import {
  useState,
  useCallback,
  useMemo,
  Suspense,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import { examples, getExampleById } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { CodeEditor } from "../../components/CodeEditor";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { Header } from "../../components/Header";

function DemoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive selected example directly from URL (single source of truth)
  const selectedExample = useMemo(() => {
    const exampleId = searchParams.get("example");
    if (exampleId) {
      return getExampleById(exampleId) ?? examples[0]!;
    }
    return examples[0]!;
  }, [searchParams]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [durationInFrames, setDurationInFrames] = useState(selectedExample.durationInFrames);
  const [fps, setFps] = useState(selectedExample.fps);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  const { code, Component, error, isCompiling, setCode, compileCode } =
    useAnimationState(selectedExample.code);

  // Auto-scroll to selected example
  useEffect(() => {
    if (selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedExample.id]);

  const handleExampleSelect = useCallback(
    (exampleId: string) => {
      const example = getExampleById(exampleId);
      if (example) {
        setCode(example.code);
        compileCode(example.code);
        setDurationInFrames(example.durationInFrames);
        setFps(example.fps);
        router.replace(`/code-examples?example=${exampleId}`, {
          scroll: false,
        });
      }
    },
    [setCode, compileCode, router],
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      compileCode(newCode);
    },
    [setCode, compileCode],
  );

  const categories = Array.from(new Set(examples.map((e) => e.category)));

  return (
    <div className="h-screen w-screen bg-background flex flex-col [&_::-webkit-scrollbar]:w-1.5 [&_::-webkit-scrollbar-track]:bg-transparent [&_::-webkit-scrollbar-thumb]:bg-border [&_::-webkit-scrollbar-thumb]:rounded-full hover:[&_::-webkit-scrollbar-thumb]:bg-secondary">
      {/* Header with logo */}
      <header className="flex items-center gap-6 py-8 px-12 shrink-0">
        <div className="flex flex-col gap-2">
          <Header asLink />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground-dim hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </Link>
        </div>
        <div className="h-10 w-px bg-border" />
        <h1 className="text-sm font-medium text-muted-foreground">Example Gallery</h1>
      </header>

      {/* Main content with sidebar */}
      <div className="flex-1 flex overflow-hidden px-12">
        {/* Sidebar */}
        <div
          className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-64 mr-8" : "w-0 border-r-0"
          }`}
        >
          <div
            className={`flex-1 overflow-y-auto pr-4 w-64 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {categories.map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground-dim uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {examples
                    .filter((e) => e.category === category)
                    .map((example) => (
                      <button
                        key={example.id}
                        ref={
                          selectedExample.id === example.id
                            ? selectedButtonRef
                            : null
                        }
                        onClick={() => handleExampleSelect(example.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedExample.id === example.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border-dim bg-muted text-gray-400 hover:border-border hover:bg-background-elevated"
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {example.name}
                        </div>
                        <div className="text-xs text-muted-foreground-dim mt-1 line-clamp-2">
                          {example.description}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 pb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg border border-border-dim bg-muted text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {selectedExample.name}
              </h2>
              <p className="text-sm text-muted-foreground-dim">
                {selectedExample.description}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-auto lg:overflow-hidden">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              isStreaming={false}
              streamPhase="idle"
            />
            <div className="shrink-0 lg:shrink lg:flex-[2.5] lg:min-w-0 lg:h-full">
              <AnimationPlayer
                Component={Component}
                durationInFrames={durationInFrames}
                fps={fps}
                onDurationChange={setDurationInFrames}
                onFpsChange={setFps}
                isCompiling={isCompiling}
                isStreaming={false}
                error={error}
                code={code}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
}
