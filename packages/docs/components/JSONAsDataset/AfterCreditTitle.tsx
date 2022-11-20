import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const CreditTitle: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const scale = spring({
    fps,
    frame,
    durationInFrames: 25,
    config: {
      damping: 100
    }
  });
  return (

    <div style={
      {
        transform: `scale(${scale})`,
        fontFamily: "Cubano",
        fontWeight: "bold",
        display: 'flex',
        flexDirection: 'row',
        letterSpacing: '3px',
        padding: '10px',
        justifyContent: 'center',
        justifyItems: 'center',
        flexFlow: 'wrap',
        color: 'white',
        fontSize: '100px',

      }
    }>
      Credits
    </div>
  )
}

export default CreditTitle;