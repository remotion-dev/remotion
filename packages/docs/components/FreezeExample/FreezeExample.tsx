import { Player } from "@remotion/player";
import React,{useState} from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  Freeze,
  spring,
  getInputProps,
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

const BlueSquareFreeze: React.FC<{frame:number}> = ({frame}) => {
  return (
    <Freeze frame={frame}>
      <BlueSquare />
    </Freeze>
  );
};



export const FreezeExample: React.FC = ( ) =>{ 
  const [isFreeze,setIsFreeze] = useState(false);
  const [frame,setFrameNumber] = useState(30);
  return (
    <div>
      <Player
        component={isFreeze? BlueSquareFreeze:BlueSquare}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        durationInFrames={150}
        fps={30}
        style={{
          width: "100%",
        }}
        inputProps={{
          frame
        }}
        loop
       />
       <div>
        <label>
          <input type='checkbox' checked={isFreeze} onChange={ (e) => setIsFreeze(!isFreeze)} />
          Use Freeze component
        </label>
        </div>
        <div>
        <label>
          <input type='number' value={frame} onChange={ (e) => setFrameNumber(Number(e.target.value))} />
          Frame of the Freeze
        </label>
       </div>
    </div>
  );
};