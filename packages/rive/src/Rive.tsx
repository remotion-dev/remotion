import React from "react";
import { useRive } from "@rive-app/react-canvas";
import { useVideoConfig, useCurrentFrame } from "remotion";

interface RiveProps {
  src: string;
}

export const Rive: React.FC<RiveProps> = ({ src }) => {
  const { width, fps, height } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  const animationRef = React.useRef<any>(null);

  // get the rive component and its instance from `useRive`
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    stateMachines: ["default"],
    artboard: "artboard 1",
  });

  React.useEffect(() => {
    if (animationRef.current) {
      animationRef.current.advance(currentFrame / fps);
    }
  }, [currentFrame, fps]);

  return (
    <div style={{ height, width }}>
      {RiveComponent ? <RiveComponent /> : null}
    </div>
  );
};
