import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./realvideos.module.css";

export const RealMP4Videos: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const callback: IntersectionObserverCallback = useCallback((data) => {
    setIsIntersecting(data[0].isIntersecting);
  }, []);

  useEffect(() => {
    const { current } = ref;
    if (!current) {
      return;
    }

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5,
    });
    observer.observe(current);

    return () => observer.unobserve(current);
  }, [callback]);

  return (
    <div ref={ref} className={styles.realvideos}>
      <div>
        <h2 className={styles.realtitle}>
          Real <span className={styles.realgradient}>.mp4</span> videos
        </h2>
        <p>
          Remotion renders all frames to images and <br /> encodes them to a
          real video - audio support included. <br /> WebM and other formats are
          also supported.
        </p>
      </div>
      <div className={styles.realmp4container}>
        <img
          src="/img/mp4.png"
          className={styles.icon}
          style={{
            width: 110,
            animationPlayState: isIntersecting ? "running" : "paused",
          }}
        />
      </div>
    </div>
  );
};
