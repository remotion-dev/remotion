import type { PlayerRef } from "@remotion/player";
import { Player } from "@remotion/player";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ColorDemoProps } from "../ColorDemo";
import { ColorDemo } from "../ColorDemo";
import styles from "./mobileplayer.module.css";

export const ProgrammaticContent: React.FC<{
  username: string;
  color: string;
}> = ({ username, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const [isIntersecting, setIsIntersecting] = useState(false);

  const callback: IntersectionObserverCallback = useCallback(
    (newData) => {
      setIsIntersecting(newData[0].isIntersecting);
      if (isIntersecting) {
        playerRef.current?.play();
      } else {
        playerRef.current?.pause();
      }
    },
    [isIntersecting]
  );

  useEffect(() => {
    const { current } = containerRef;
    if (!current) {
      return;
    }

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 1,
    });
    // Docusaurus sometimes has a layout shift that immediately focuses
    // the video on page load
    setTimeout(() => {
      observer.observe(current);
    }, 2000);

    return () => observer.unobserve(current);
  }, [callback]);

  useEffect(() => {
    if (isIntersecting) {
      playerRef.current?.play();
    }
  }, [isIntersecting]);

  const props: ColorDemoProps = useMemo(() => {
    return {
      color,
      username,
    };
  }, [color, username]);

  return (
    <div ref={containerRef} className={styles.mobileplayer}>
      <Player
        ref={playerRef}
        component={ColorDemo}
        compositionHeight={720}
        compositionWidth={1280}
        durationInFrames={100}
        fps={30}
        controls
        style={{ width: "100%" }}
        inputProps={props}
        loop
      />
    </div>
  );
};
