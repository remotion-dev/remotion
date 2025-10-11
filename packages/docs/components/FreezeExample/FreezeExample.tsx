import { Player } from "@remotion/player";
import React, { useState } from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";

const BlueSquare: React.FC = () => {
  const frame = useCurrentFrame();
  const animation = spring({
    fps: 30,
    frame,
    config: {
      damping: 400,
    },
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          height: 200,
          width: 200,
          backgroundColor: "#3498db",
          borderRadius: 20,
          transform: `translateY(${interpolate(
            animation,
            [0, 1],
            [600, 0]
          )}px)`,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 50,
        }}
      >
        {frame}
      </div>
    </AbsoluteFill>
  );
};

const BlueSquareFreeze: React.FC<{ readonly frozen: number | null }> = ({ frozen }) => {
  if (frozen !== null) {
    return (
      <Freeze frame={frozen}>
        <BlueSquare />
      </Freeze>
    );
  }

  return <BlueSquare />;
};

export const FreezeExample: React.FC = () => {
  const [isFreeze, setIsFreeze] = useState(false);
  const [frame, setFrameNumber] = useState(30);
  return (
    <div>
      <Player
        component={BlueSquareFreeze}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        durationInFrames={150}
        fps={30}
        style={{
          width: "100%",
        }}
        inputProps={{
          frozen: isFreeze ? frame : null,
        }}
        loop
      />
      <div>
        <label>
          <input
            type="checkbox"
            checked={isFreeze}
            onChange={() => setIsFreeze(!isFreeze)}
          />
          Use Freeze component
        </label>
      </div>
      {isFreeze ? (
        <div>
          <label>
            <input
              type="number"
              value={frame}
              style={{ width: 50, marginRight: 8, padding: 8 }}
              onChange={(e) => setFrameNumber(Number(e.target.value))}
            />
            Frame of the Freeze
          </label>
        </div>
      ) : null}
    </div>
  );
};
