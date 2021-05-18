import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./editor.module.css";

export const LightningFastEditor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const callback: IntersectionObserverCallback = useCallback((data) => {
    const { isIntersecting } = data[0];
    setIsIntersecting(isIntersecting);
    if (isIntersecting) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, []);

  useEffect(() => {
    const { current } = ref;
    if (!current) {
      return;
    }
    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.2,
    });
    observer.observe(current);

    return () => observer.unobserve(current);
  }, []);
  return (
    <div className={styles.row} ref={ref}>
      <div>
        <video
          src="/img/player-demo.mp4"
          autoPlay
          className={styles.video}
          muted
          playsInline
          loop
          style={{
            animationPlayState: isIntersecting ? "running" : "paused",
            width: 500,
            maxWidth: "100%",
            borderRadius: 7,
            overflow: "hidden",
          }}
        ></video>
      </div>
      <div style={{ flex: 1 }}>
        <h2 className={styles.title}>
          Fast and <br /> <span className={styles.mp4}>delightful</span> editing
        </h2>
        <p>
          Preview your video in the browser. <br />
          Fast refresh while the video is playing. <br />
          Scrub through the timeline to get every frame perfect.
        </p>
      </div>
    </div>
  );
};
