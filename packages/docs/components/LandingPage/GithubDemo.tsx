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
import styles from "./githubdemo.module.css";

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
          <h1
            className={styles.githubdemotitle}
            style={{ transform: `translateY(${titleTranslation}px)` }}
          >
            Hi {data.login}!
          </h1>
          <p
            className={styles.githubdemodescription}
            style={{ opacity: subtitleOpacity }}
          >
            You have {data.followers} followers.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
