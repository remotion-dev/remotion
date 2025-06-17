import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Img,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import type { Brand, LinkType, Platform } from "../../../config/endcard";
import { avatars, channels } from "../../../config/endcard";
import type { Theme } from "../../../config/themes";
import { SCENE_TRANSITION_DURATION } from "../../../config/transitions";
import { FollowButton, followButtonHeight } from "./FollowButton";
import { IconRow, spaceBetweenImgAndText } from "./IconRow";
import { Links } from "./Links";

const Avatar: React.FC<{
  avatar: string;
  theme: Theme;
}> = ({ avatar, theme }) => {
  return (
    <Img
      style={{
        height: followButtonHeight,
        width: followButtonHeight,
        borderRadius: "50%",
        boxShadow:
          theme === "light"
            ? "0px 0px 20px rgba(0, 0, 0, 0.2)"
            : "0px 0px 50px rgba(255, 255, 255, 0.2)",
      }}
      src={avatar}
    />
  );
};

const style: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const FollowCTA: React.FC<{
  platform: Platform;
  avatar: string;
  theme: Theme;
  isLinkedInBusinessPage: boolean;
}> = ({ platform, avatar, theme, isLinkedInBusinessPage }) => {
  return (
    <div style={style}>
      <Avatar theme={theme} avatar={avatar} />
      <div style={{ width: spaceBetweenImgAndText }} />
      <FollowButton
        theme={theme}
        platform={platform}
        isLinkedInBusinessPage={isLinkedInBusinessPage}
      />
    </div>
  );
};

export const LeftSide: React.FC<{
  platform: Platform;
  channel: Brand;
  links: LinkType[];
  theme: Theme;
}> = ({ platform, channel, links, theme }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender());
  const [contentHeight, setHeight] = useState(0);

  const { fps, width } = useVideoConfig();
  const frame = useCurrentFrame();

  const slideDelay = SCENE_TRANSITION_DURATION + 20;
  const slideDuration = 30;

  const scale = useCurrentScale();

  const slideUp = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: slideDelay,
    durationInFrames: slideDuration,
  });

  useEffect(() => {
    const calc = () => {
      const cb = window.requestAnimationFrame(() => {
        const height = ref.current?.getBoundingClientRect().height as number;
        if (height === 0) {
          calc();
          return;
        }

        const scaled = height / scale;

        setHeight(scaled);
        continueRender(handle);
      });

      return () => {
        window.cancelAnimationFrame(cb);
      };
    };

    const cleanup = calc();

    return () => {
      cleanup();
    };
  }, [handle, scale]);

  const otherPlatforms = useMemo(() => {
    const configs: {
      name: string;
      platform: Platform;
    }[] = [];

    for (const c in channels[channel]) {
      const name = channels[channel][c as Platform];
      if (!name) {
        continue;
      }

      if (c === platform) {
        continue;
      }
      if (c === "isLinkedInBusinessPage") {
        continue;
      }

      configs.push({
        name,
        platform: c as Platform,
      });
    }

    return configs;
  }, [channel, platform]);

  const totalLinks = links.length + otherPlatforms.length;

  const padding = 80;
  const maxWidth = width - padding * 2;

  return (
    <AbsoluteFill
      style={{
        left: 80,
        justifyContent: "center",
        maxWidth: Math.min(maxWidth, 1000),
      }}
    >
      <div
        ref={scaler}
        style={{ height: 100, position: "absolute", top: -100000 }}
      />
      <div
        style={{
          transform: `translateY(${interpolate(
            slideUp,
            [0, 1],
            [contentHeight / 2, 0],
          )}px)`,
        }}
      >
        <FollowCTA
          theme={theme}
          avatar={avatars[channel]}
          platform={platform}
          isLinkedInBusinessPage={channels[channel].isLinkedInBusinessPage}
        />
      </div>
      <div ref={ref}>
        <div style={{ height: 80 }} />
        {otherPlatforms.map((p, i) => {
          const indexFromLast = links.length + otherPlatforms.length - i;
          const opacity = spring({
            fps,
            frame,
            config: {
              damping: 200,
            },
            delay:
              slideDelay +
              ((indexFromLast - 1) / totalLinks) * (slideDuration - 15),
            durationInFrames: 15,
          });

          return (
            <IconRow
              key={p.platform}
              opacity={opacity}
              type={p.platform}
              label={p.name}
              theme={theme}
            />
          );
        })}
        <Links
          links={links}
          slideDelay={slideDelay}
          slideDuration={slideDuration}
          theme={theme}
          totalLinks={totalLinks}
        />
      </div>
    </AbsoluteFill>
  );
};
