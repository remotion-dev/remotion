import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ShowcaseVideo } from "../data/showcase-videos";

const A = styled.a`
  color: inherit;
  cursor: pointer;
  &:hover {
    color: inherit;
  }
`;

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
    imageUrl: string;
    title: string;
    description: React.ReactNode;
    onClick: () => void;
  }
> = ({ imageUrl, title, description, onClick, muxId }) => {
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

  return (
    <A
      ref={container}
      className={clsx("col col--4", videoStyle)}
      onClick={onClick}
    >
      <div className="text--center">
        <div
          style={{
            width: 300,
            height: 300,
            backgroundImage: `url(${hover ? animated : thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "50% 50%",
          }}
        >
          <img width={300} height={300}></img>
        </div>
      </div>
      <h3 style={videoTitle}>{title}</h3>
      <p>{description}</p>
    </A>
  );
};
