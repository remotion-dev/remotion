import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { mobile } from "../layout/layout";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${mobile`
    flex-direction: column-reverse;
  `}
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

const animation = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`;

const Mp4Container = styled.div`
  flex: 1;
  justify-content: flex-end;
  ${mobile`
    justify-content: flex-start;
  `}
  align-items: center;
  display: flex;
`;

const Icon = styled.img<{
  playing: boolean;
}>`
  animation: ${animation} 0.6s;
  animation-play-state: ${(props) => (props.playing ? "running" : "paused")};
  ${mobile`
    animation: none;
    margin-bottom: 30px;
  `}
`;

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
  }, []);

  return (
    <Row ref={ref}>
      <div>
        <Title>
          Real <Mp4>.mp4</Mp4> videos
        </Title>
        <p>
          Remotion renders all frames to images and <br /> encodes them to a
          real video - audio support included. <br /> WebM and other formats are
          also supported.
        </p>
      </div>
      <Mp4Container>
        <Icon
          playing={isIntersecting}
          src="/img/mp4.png"
          style={{ width: 110 }}
        ></Icon>
      </Mp4Container>
    </Row>
  );
};
