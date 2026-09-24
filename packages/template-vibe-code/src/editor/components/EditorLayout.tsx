"use client";

import React from "react";
import { useEditor } from "../state/editor-context";
import { CanvasPanel } from "./CanvasPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./Inspector/InspectorPanel";
import { ResizeHandle } from "./ResizeHandle";
import { SidebarPanel } from "./SidebarPanel";
import { Timeline } from "./Timeline/Timeline";
import { TopBar } from "./TopBar";
import { Transport } from "./Transport";

export const EditorLayout: React.FC<{
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
}> = ({ iframeRef }) => {
  const { state, dispatch } = useEditor();
  const { layout } = state;
  const setLayout = (patch: Partial<typeof layout>) =>
    dispatch({ type: "set-layout", patch });

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        {layout.showSidebar ? (
          <>
            <aside
              className="bg-background-panel flex shrink-0 flex-col"
              style={{ width: layout.sidebarWidth }}
            >
              <SidebarPanel />
            </aside>
            <ResizeHandle
              axis="x"
              value={layout.sidebarWidth}
              min={180}
              max={480}
              onChange={(sidebarWidth) => setLayout({ sidebarWidth })}
            />
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            {layout.showCode ? (
              <>
                <section
                  aria-label="Code"
                  className="bg-background-editor flex shrink-0 flex-col"
                  style={{ width: layout.codeWidth }}
                >
                  <CodePanel />
                </section>
                <ResizeHandle
                  axis="x"
                  value={layout.codeWidth}
                  min={280}
                  max={1200}
                  onChange={(codeWidth) => setLayout({ codeWidth })}
                />
              </>
            ) : null}
            <section
              aria-label="Preview"
              className="flex min-w-0 flex-1 flex-col"
            >
              <CanvasPanel iframeRef={iframeRef} />
              <Transport />
            </section>
          </div>
          {layout.showTimeline ? (
            <>
              <ResizeHandle
                axis="y"
                value={layout.timelineHeight}
                min={120}
                max={600}
                invert
                onChange={(timelineHeight) => setLayout({ timelineHeight })}
              />
              <section
                aria-label="Timeline"
                className="bg-background-panel flex shrink-0 flex-col"
                style={{ height: layout.timelineHeight }}
              >
                <Timeline />
              </section>
            </>
          ) : null}
        </div>
        {layout.showInspector ? (
          <>
            <ResizeHandle
              axis="x"
              value={layout.inspectorWidth}
              min={240}
              max={520}
              invert
              onChange={(inspectorWidth) => setLayout({ inspectorWidth })}
            />
            <aside
              className="bg-background-panel flex shrink-0 flex-col"
              style={{ width: layout.inspectorWidth }}
            >
              <InspectorPanel />
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
};
