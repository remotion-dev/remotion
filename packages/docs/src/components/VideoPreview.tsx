import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ShowcaseVideo } from "../data/showcase-videos";

const a: React.CSSProperties = {
  color: "inherit",
  cursor: "pointer",
};

const videoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "2rem 0",
  width: "100%",
};

const videoTitle: React.CSSProperties = {
  marginTop: "1rem",
};

export const VideoPreview: React.FC<
  ShowcaseVideo & {
    title: string;
    description: React.ReactNode;
    onClick: () => void;
  }
> = ({ title, description, onClick, muxId }) => {
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

  const style = useMemo(() => {
    return {
      width: 300,
      height: 300,
      backgroundImage: `url(${hover ? animated : thumbnail})`,
      backgroundSize: "cover",
      backgroundPosition: "50% 50%",
    };
  }, [animated, hover, thumbnail]);

  return (
    <a
      ref={container}
      style={a}
      className={clsx("col col--4", videoStyle)}
      onClick={onClick}
    >
      <div className="text--center">
        <div style={style}>
          <img width={300} height={300} />
        </div>
      </div>
      <h3 style={videoTitle}>{title}</h3>
      <p>{description}</p>
    </a>
  );
};
