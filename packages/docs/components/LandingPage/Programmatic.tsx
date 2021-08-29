import { Player, PlayerRef } from "@remotion/player";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GithubDemo, GithubResponse } from "./GithubDemo";
import styles from "./mobileplayer.module.css";

export const ProgrammaticContent: React.FC<{ data: GithubResponse | null }> = ({
  data,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const [isIntersecting, setIsIntersecting] = useState(false);

  const callback: IntersectionObserverCallback = useCallback((data) => {
    const { isIntersecting } = data[0];
    setIsIntersecting(isIntersecting);
    if (isIntersecting) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
    }
  }, []);

  useEffect(() => {
    const { current } = containerRef;
    if (!current) {
      return;
    }

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 1,
    });
    observer.observe(current);

    return () => observer.unobserve(current);
  }, [callback]);

  useEffect(() => {
    if (isIntersecting) {
      playerRef.current?.play();
    }
  }, [data, isIntersecting]);

  return (
    <div ref={containerRef} className={styles.mobileplayer}>
      <Player
        ref={playerRef}
        component={GithubDemo}
        compositionHeight={720}
        compositionWidth={1280}
        durationInFrames={100}
        fps={30}
        controls
        style={{ width: "100%" }}
        inputProps={{ data }}
      />
    </div>
  );
};
