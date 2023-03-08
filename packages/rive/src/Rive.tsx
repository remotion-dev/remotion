import { useRive } from "@rive-app/react-canvas";
import { useVideoConfig, useCurrentFrame } from "remotion";

interface RiveProps {
  src: string;
  artboardName: string;
  stateMachineName: string;
}

export const Rive = ({ src }: RiveProps) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
  });

  if (rive) {
    const animation = rive.load(src);
    animation.advance((frame / fps) * 30);
  }

  return (
    <div style={{ width: width, height: height }}>
      {RiveComponent ? <RiveComponent /> : null}
    </div>
  );
};
