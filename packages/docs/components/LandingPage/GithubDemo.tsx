import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  measureSpring,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import styled from "styled-components";

const Title = styled.h1`
  font-size: 5em;
  color: var(--text-color);
  margin-bottom: 0;
  margin-top: 0;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`;

const Description = styled.p`
  font-size: 3em;
  margin-bottom: 0;
  margin-top: 0;
  line-height: 1.4;
  color: var(--text-color);

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`;

export type GithubResponse = {
  login: string;
  avatar_url: string;
  followers: number;
};
export const GithubDemo: React.FC<{
  data: GithubResponse | null;
}> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  const springDur = measureSpring({ fps, config: { damping: 200 } });

  const titleTranslation = interpolate(progress, [0, 1], [700, 0]);
  const subtitleOpacity = interpolate(
    frame,
    [springDur + 15, springDur + 40],
    [0, 1]
  );

  if (!data) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "var(--ifm-background-color)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Img
          src={data.avatar_url}
          style={{
            borderRadius: 150,
            height: 300,
            width: 300,
            transform: `scale(${progress})`,
          }}
        />
        <div style={{ width: 60 }} />
        <div>
          <Title style={{ transform: `translateY(${titleTranslation}px)` }}>
            Hi {data.login}!
          </Title>
          <Description style={{ opacity: subtitleOpacity }}>
            You have {data.followers} followers.
          </Description>
        </div>
      </div>
    </AbsoluteFill>
  );
};
