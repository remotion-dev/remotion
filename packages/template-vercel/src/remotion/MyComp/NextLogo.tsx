import { evolvePath } from "@remotion/paths";
import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const nStroke =
  "M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z";

export const NextLogo: React.FC<{
  outProgress: number;
}> = ({ outProgress }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const evolve1 = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });
  const evolve2 = spring({
    fps,
    frame: frame - 15,
    config: {
      damping: 200,
    },
  });
  const evolve3 = spring({
    fps,
    frame: frame - 30,
    config: {
      damping: 200,
      mass: 3,
    },
    durationInFrames: 30,
  });

  const style: React.CSSProperties = useMemo(() => {
    return {
      height: 140,
      borderRadius: 70,
      scale: String(1 - outProgress),
    };
  }, [outProgress]);

  const firstPath = `M 60.0568 54 v 71.97`;
  const secondPath = `M 63.47956 56.17496 L 144.7535 161.1825`;
  const thirdPath = `M 121 54 L 121 126`;

  const evolution1 = evolvePath(evolve1, firstPath);
  const evolution2 = evolvePath(evolve2, secondPath);
  const evolution3 = evolvePath(
    interpolate(evolve3, [0, 1], [0, 0.7]),
    thirdPath,
  );

  return (
    <svg style={style} fill="none" viewBox="0 0 180 180">
      <mask
        height="180"
        id="mask"
        className="[mask-type:alpha]"
        width="180"
        x="0"
        y="0"
      >
        <circle cx="90" cy="90" fill="black" r="90"></circle>
      </mask>
      <mask id="n-mask" className="[mask-type:alpha]">
        <path d={nStroke} fill="black"></path>
      </mask>
      <g mask="url(#mask)">
        <circle cx="90" cy="90" fill="black" r="90"></circle>
        <g stroke="url(#gradient0)" mask="url(#n-mask)">
          <path
            strokeWidth="12.1136"
            d={firstPath}
            strokeDasharray={evolution1.strokeDasharray}
            strokeDashoffset={evolution1.strokeDashoffset}
          ></path>
          <path
            strokeWidth={12.1136}
            d={secondPath}
            strokeDasharray={evolution2.strokeDasharray}
            strokeDashoffset={evolution2.strokeDashoffset}
          ></path>
        </g>
        <path
          stroke="url(#gradient1)"
          d={thirdPath}
          strokeDasharray={evolution3.strokeDasharray}
          strokeDashoffset={evolution3.strokeDashoffset}
          strokeWidth="12"
        ></path>
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="gradient0"
          x1="109"
          x2="144.5"
          y1="116.5"
          y2="160.5"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="gradient1"
          x1="121"
          x2="120.799"
          y1="54"
          y2="106.875"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
};
