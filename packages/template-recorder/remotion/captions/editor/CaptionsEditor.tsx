import { Caption } from "@remotion/captions";
import { writeStaticFile } from "@remotion/studio";
import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { AbsoluteFill } from "remotion";
import type { Theme } from "../../../config/themes";
import { EditCaption } from "./EditCaption";
import { SubsEditorFooter } from "./Footer";
import { SubsEditorHeader } from "./Header";
import { FOOTER_HEIGHT, HEADER_HEIGHT, captionEditorPortal } from "./layout";
import { useCaptionOverlay } from "./use-caption-overlay";

export const CaptionsEditor: React.FC<{
  captions: Caption[];
  setCaptions: React.Dispatch<React.SetStateAction<Caption[] | null>>;
  filePath: string;
  initialCaption: Caption;
  trimStart: number;
  theme: Theme;
}> = ({
  captions,
  filePath,
  initialCaption,
  trimStart,
  theme,
  setCaptions,
}) => {
  const overlay = useCaptionOverlay();
  const setAndSaveCaptions = useCallback(
    (updater: (old: Caption[]) => Caption[]) => {
      setCaptions((old) => {
        if (old === null) {
          return null;
        }

        if (!window.remotion_publicFolderExists) {
          throw new Error("window.remotion_publicFolderExists is not set");
        }

        const newOutput = updater(old);
        const contents = JSON.stringify(newOutput, null, 2);

        writeStaticFile({
          filePath,
          contents,
        });

        return newOutput;
      });
    },
    [filePath, setCaptions],
  );

  const longestNumberLength = String(
    Math.max(
      ...captions.map((t) => t.startMs),
      ...(captions.map((t) => t.endMs).filter((t) => t !== null) as number[]),
    ),
  ).length;

  const onChangeText = useCallback(
    (index: number, newText: string) => {
      setAndSaveCaptions((old) => {
        const newTranscription = old.map((t, i) => {
          if (i === index) {
            return {
              ...t,
              text: newText,
            };
          }

          return t;
        });
        return newTranscription;
      });
    },
    [setAndSaveCaptions],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        overlay.setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [overlay, overlay.setOpen]);

  if (!captionEditorPortal.current) {
    return null;
  }

  return ReactDOM.createPortal(
    <AbsoluteFill
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <AbsoluteFill
        style={{
          overflowY: "auto",
          paddingTop: HEADER_HEIGHT,
          paddingBottom: FOOTER_HEIGHT,
        }}
      >
        {captions.map((caption, i) => {
          return (
            <EditCaption
              key={[caption.startMs, caption.endMs, i].join("-")}
              theme={theme}
              index={i}
              longestNumberLength={longestNumberLength}
              caption={caption}
              isInitialCaption={caption.startMs === initialCaption.endMs}
              trimStart={trimStart}
              onUpdateText={onChangeText}
            />
          );
        })}
      </AbsoluteFill>
      <SubsEditorHeader />
      <SubsEditorFooter fileName={filePath} />
    </AbsoluteFill>,
    captionEditorPortal.current as HTMLDivElement,
  );
};
