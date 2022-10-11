import { Player } from "@remotion/player";
import React, { useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { MotionBlur } from '@remotion/motion-blur';

const square: React.CSSProperties = {
  height: 150,
  width: 150,
  backgroundColor: '#0b84f3',
  borderRadius: 14,
};

export const Square: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const spr = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: 60,
  });

  const rotate = interpolate(spr, [0, 1], [Math.PI, 0]);
  const y = interpolate(spr, [0, 1], [height, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateY(${y}px) rotate(${rotate}rad)`,
      }}
    >
      <div style={square} />
    </AbsoluteFill>
  );
};

const MyComposition = ({
  opacity,
  iterations,
  frameDelay,
}: {
  opacity: number,
  iterations: number,
  frameDelay: number,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MotionBlur opacity={opacity} frameDelay={frameDelay} iterations={iterations}>
        <Square />
      </MotionBlur>
    </AbsoluteFill>
  );
};


export const MotionBlurExample: React.FC = () => {
  const [opacity, setOpacity] = useState(1);
  const [frameDelay, setFrameDelay] = useState(0.3);
  const [iterations, setIterations] = useState(50);

  return (
    <div>
      <Player
        component={MyComposition}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        durationInFrames={150}
        fps={30}
        style={{
          width: "100%",
        }}
        inputProps={{
          opacity,
          frameDelay,
          iterations,
        }}
        loop
      />
      <div style={{ marginTop: '50px' }}>
        <label>
          <input
            type="number"
            min={0}
            step={0.05}
            value={opacity}
            style={{ width: 90, marginRight: 8, padding: 8 }}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
          Opacity
        </label>
      </div>
      <div>
        <label>
          <input
            type="number"
            min={0}
            value={iterations}
            style={{ width: 90, marginRight: 8, padding: 8 }}
            onChange={(e) => setIterations(Number(e.target.value))}
          />
          Iterations
        </label>
      </div>
      <div>
        <label>
          <input
            type="number"
            min={0}
            value={frameDelay}
            style={{ width: 90, marginRight: 8, padding: 8 }}
            onChange={(e) => setFrameDelay(Number(e.target.value))}
          />
          Frame Delay
        </label>
      </div>
    </div>
  );
};
