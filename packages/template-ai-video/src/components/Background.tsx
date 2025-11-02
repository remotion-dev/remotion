import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, IMAGE_HEIGHT, IMAGE_WIDTH } from "../lib/constants";
import { BackgroundElement } from "../lib/types";
import { calculateBlur, getImagePath } from "../lib/utils";

const EXTRA_SCALE = 0.2;

export const Background: React.FC<{
  item: BackgroundElement;
  project: string;
}> = ({ item, project }) => {
  const frame = useCurrentFrame();
  const localMs = (frame / FPS) * 1000;
  const { width, height } = useVideoConfig();

  const imageRatio = IMAGE_HEIGHT / IMAGE_WIDTH;

  const imgWidth = height;
  const imgHeight = imgWidth * imageRatio;
  let animScale = 1 + EXTRA_SCALE;

  const currentScaleAnim = item.animations?.find(
    (anim) =>
      anim.type === "scale" && anim.startMs <= localMs && anim.endMs >= localMs,
  );

  if (currentScaleAnim) {
    const progress =
      (localMs - currentScaleAnim.startMs) /
      (currentScaleAnim.endMs - currentScaleAnim.startMs);
    animScale =
      EXTRA_SCALE +
      progress * (currentScaleAnim.to - currentScaleAnim.from) +
      currentScaleAnim.from;
  }

  const imgScale = animScale;
  const top = -(imgHeight * imgScale - height) / 2;
  const left = -(imgWidth * imgScale - width) / 2;

  const blur = calculateBlur({ item, localMs });
  const maxBlur = 25;

  const currentBlur = maxBlur * blur;

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(getImagePath(project, item.imageUrl))}
        style={{
          width: imgWidth * imgScale,
          height: imgHeight * imgScale,
          position: "absolute",
          top,
          left,
          filter: `blur(${currentBlur}px)`,
          WebkitFilter: `blur(${currentBlur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
