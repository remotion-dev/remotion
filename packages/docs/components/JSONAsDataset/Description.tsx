import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { MetadataType } from "./types"

const Description: React.FC<{
  name: string,
  metadata: MetadataType
}> = ({ name, metadata }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [50, 100],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  const moveY = interpolate(
    frame,
    [20, 30],
    [10, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontSize: '40px',
        transform: `translateY(${moveY}px)`
      }}>
        {name}
      </div>

      <div style={{
        fontSize: '20px',
        opacity: `${opacity}`,
        fontFamily: 'Arial'
      }}>
        {metadata.project_url}
      </div>

    </div>

  )
}

export default Description;
