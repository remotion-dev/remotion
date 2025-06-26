import { Caption } from "@remotion/captions";
import React, { useEffect, useMemo, useState } from "react";
import type { StaticFile } from "remotion";
import { continueRender, delayRender, watchStaticFile } from "remotion";
import type { Theme } from "../../../config/themes";
import { CaptionsEditor } from "./CaptionsEditor";
import type { CaptionsContextType } from "./captions-provider";
import { CaptionsProvider } from "./captions-provider";
import { CaptionOverlayProvider } from "./use-caption-overlay";

export const CaptionOverlay: React.FC<{
  children: React.ReactNode;
  file: StaticFile;
  theme: Theme;
  trimStart: number;
}> = ({ children, file, theme, trimStart }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender());

  const [subEditorOpen, setSubEditorOpen] = useState<Caption | false>(false);
  const [changeStatus, setChangeStatus] = useState<
    "initial" | "changed" | "unchanged"
  >("initial");

  const state = useMemo(() => {
    return { open: subEditorOpen, setOpen: setSubEditorOpen };
  }, [subEditorOpen, setSubEditorOpen]);

  useEffect(() => {
    // Don't listen to filesystem changes
    // if the sub editor is open
    if (subEditorOpen) {
      return;
    }

    const { cancel } = watchStaticFile(
      file.name,
      (newData: StaticFile | null) => {
        if (newData) {
          setChangeStatus("changed");
        }
      },
    );
    return () => {
      cancel();
    };
  }, [file.name, subEditorOpen]);

  useEffect(() => {
    if (changeStatus === "initial" || changeStatus === "changed") {
      fetch(file.src)
        .then((res) => res.json())
        .then((d) => {
          continueRender(handle);
          setCaptions(d);
        });
      setChangeStatus("unchanged");
    }
  }, [changeStatus, file.src, handle]);

  const captionState: CaptionsContextType = useMemo(() => {
    return {
      captions,
      setCaptions,
    };
  }, [captions]);

  if (!captionState.captions) {
    return null;
  }

  return (
    <CaptionOverlayProvider state={state}>
      <CaptionsProvider state={captionState}>{children}</CaptionsProvider>
      {subEditorOpen && captions ? (
        <CaptionsEditor
          initialCaption={subEditorOpen}
          setCaptions={setCaptions}
          captions={captions}
          filePath={file.name}
          trimStart={trimStart}
          theme={theme}
        />
      ) : null}
    </CaptionOverlayProvider>
  );
};
