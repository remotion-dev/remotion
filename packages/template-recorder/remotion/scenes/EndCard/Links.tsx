import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { LinkType } from "../../../config/endcard";
import type { Theme } from "../../../config/themes";
import { IconRow } from "./IconRow";

export const Links: React.FC<{
  links: LinkType[];
  slideDelay: number;
  totalLinks: number;
  slideDuration: number;
  theme: Theme;
}> = ({ links, slideDelay, totalLinks, slideDuration, theme }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <>
      {links.length > 0 ? <div style={{ height: 80 }} /> : null}
      {links.map((l, i) => {
        const indexFromLast = links.length - i;
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
            key={l.link}
            opacity={opacity}
            type="link"
            label={l.link}
            theme={theme}
          />
        );
      })}
    </>
  );
};
