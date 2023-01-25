import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ShowcaseVideo } from "../data/showcase-videos";

const videoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "2rem 0",
  width: "100%",
};

const videoTitle: React.CSSProperties = {
  marginTop: "1rem",
};

const padding: React.CSSProperties = {
  padding: "0 var(--ifm-spacing-horizontal)",
};
export const VideoPreview: React.FC<
  ShowcaseVideo & {
    title: string;
    description: React.ReactNode;
    onClick: () => void;
    mobileLayout: boolean;
    mobileHeight: number;
  }
> = ({ title, description, onClick, muxId, mobileLayout, mobileHeight }) => {
  const [hover, setHover] = useState(false);

  const container = useRef<HTMLAnchorElement>(null);

  const animated = `https://image.mux.com/${muxId}/animated.gif?width=600`;
  const thumbnail = `https://image.mux.com/${muxId}/thumbnail.png?width=600`;

  useEffect(() => {
    const { current } = container;
    if (!current) {
      return;
    }

    const onPointerEnter = () => {
      setHover(true);
    };

    const onPointerLeave = () => {
      setHover(false);
    };

    current.addEventListener("pointerenter", onPointerEnter);
    current.addEventListener("pointerleave", onPointerLeave);

    return () => {
      current.removeEventListener("pointerenter", onPointerEnter);
      current.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const a: React.CSSProperties = useMemo(() => {
    return {
      color: "inherit",
      cursor: "pointer",
      margin: "auto",
      width: mobileLayout ? mobileHeight : 300,
      maxWidth: mobileLayout ? mobileHeight : 300,
      display: "block",
      flex: 1,
    };
  }, [mobileHeight, mobileLayout]);

  const style = useMemo(() => {
    return {
      width: mobileLayout ? mobileHeight : 300,
      height: mobileLayout ? mobileHeight : 300,
      backgroundImage: `url(${hover ? animated : thumbnail})`,
      backgroundSize: "cover",
      backgroundPosition: "50% 50%",
    };
  }, [animated, hover, mobileHeight, mobileLayout, thumbnail]);

  const placeholder: React.CSSProperties = useMemo(() => {
    return {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    };
  }, []);

  return (
    <a
      ref={container}
      style={a}
      className={clsx("col col--4", videoStyle)}
      onClick={onClick}
    >
      <div className="text--center" style={placeholder}>
        <div style={style} />
      </div>
      <div style={padding}>
        <h3 style={videoTitle}>{title}</h3>
        <p>{description}</p>
      </div>
    </a>
  );
};
