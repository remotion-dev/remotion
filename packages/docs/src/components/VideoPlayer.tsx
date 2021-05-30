import React, { SVGProps, useEffect, useRef } from "react";
import { ShowcaseVideo } from "../data/showcase-videos";
import { VideoPlayerContent } from "./VideoPlayerContent";

const container: React.CSSProperties = {
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  // Higher than Docusaurus highest
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
};

const changeButton: React.CSSProperties = {
  padding: 20,
  cursor: "pointer",
};

const changeButtonInactive: React.CSSProperties = {
  padding: 20,
  cursor: "default",
  opacity: 0.5,
};

const icon: React.CSSProperties = {
  width: 24,
  color: "white",
};

const IconLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 320 512" {...props}>
    <path
      fill="currentColor"
      d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
    />
  </svg>
);
const IconRight: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 320 512" {...props}>
    <path
      fill="currentColor"
      d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
    />
  </svg>
);

export const VideoPlayer: React.FC<{
  video: ShowcaseVideo | null;
  dismiss: () => void;
  toNext: () => void;
  toPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}> = ({ video, dismiss, toNext, toPrevious, hasNext, hasPrevious }) => {
  const outside = useRef<HTMLDivElement>(null);
  const inside = useRef<HTMLDivElement>(null);
  const backButton = useRef<HTMLDivElement>(null);
  const forwardButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = outside;
    const { current: insideCurrent } = inside;
    const { current: backButtonCurrent } = backButton;
    const { current: forwardButtonCurrent } = forwardButton;
    if (!current) {
      return;
    }

    if (!insideCurrent) {
      return;
    }

    if (!backButtonCurrent) {
      return;
    }

    if (!forwardButtonCurrent) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      if (insideCurrent.contains(event.target as Node | null)) {
        return;
      }

      if (backButtonCurrent.contains(event.target as Node | null)) {
        return;
      }

      if (forwardButtonCurrent.contains(event.target as Node | null)) {
        return;
      }

      dismiss();
    };

    current.addEventListener("click", onClick);
    return () => {
      current.removeEventListener("click", onClick);
    };
  }, [dismiss, video]);

  useEffect(() => {
    if (!video) {
      return;
    }

    const onKeyPress = (e: KeyboardEvent) => {
      if (hasNext && e.key === "ArrowRight") {
        toNext();
      }

      if (hasPrevious && e.key === "ArrowLeft") {
        toPrevious();
      }

      if (hasPrevious && e.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keyup", onKeyPress);
    return () => {
      window.removeEventListener("keyup", onKeyPress);
    };
  }, [dismiss, hasNext, hasPrevious, toNext, toPrevious, video]);

  if (!video) {
    return null;
  }

  return (
    <div ref={outside} style={container}>
      <div
        ref={backButton}
        style={hasPrevious ? changeButton : changeButtonInactive}
        onClick={toPrevious}
      >
        <IconLeft style={icon} />
      </div>
      <div ref={inside}>
        <VideoPlayerContent video={video} />
      </div>
      <div
        ref={forwardButton}
        style={hasNext ? changeButton : changeButtonInactive}
        onClick={toNext}
      >
        <IconRight style={icon} />
      </div>
    </div>
  );
};
