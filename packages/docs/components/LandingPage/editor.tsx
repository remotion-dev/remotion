import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  text-align: right;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
  text-align: right;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

const animation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const Video = styled.video<{
  playing: boolean;
}>`
  animation: ${animation} 0.6s;
  animation-play-state: ${(props) => (props.playing ? "running" : "paused")};
`;

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
    <Row ref={ref}>
      <div>
        <Video
          src="/img/player-demo.mp4"
          autoPlay
          muted
          playsInline
          playing={isIntersecting}
          loop
          style={{ width: 500, borderRadius: 4, overflow: "hidden" }}
        ></Video>
      </div>
      <div style={{ flex: 1 }}>
        <Title>
          Fast and <br /> <Mp4>delightful</Mp4> editing
        </Title>
        <p>
          Preview your video in the browser. <br />
          Fast refresh while the video is playing. <br />
          Scrub through the timeline to get every frame perfect.
        </p>
      </div>
    </Row>
  );
};
