import {useThree} from "@react-three/fiber";
import {Video} from "@remotion/media";
import {useCallback, useEffect, useState} from "react";
import {staticFile, useRemotionEnvironment} from "remotion";
import {CanvasTexture} from "three";

// sample-clip.webm (VP9) is 960x540. Not the .mp4: this environment's
// Chromium can't decode H.264 through WebCodecs, and <Video>'s automatic
// fallback to <OffthreadVideo> renders an <Img>, which react-three-fiber
// rejects ("Img is not part of the THREE namespace").
const VIDEO_WIDTH = 960;
const VIDEO_HEIGHT = 540;

// A video as a Three.js texture, the way the docs now recommend
// (videos/as-threejs-texture.mdx) instead of the deprecated
// useVideoTexture()/useOffthreadVideoTexture(): a headless @remotion/media
// <Video> hands each decoded frame to onVideoFrame, which draws it into an
// OffscreenCanvas backing a CanvasTexture. Must be rendered inside
// <ThreeCanvas>, since it calls useThree().
export const VideoTexturePlane: React.FC<{rotationY: number}> = ({rotationY}) => {
  const [target] = useState(() => {
    const canvas = new OffscreenCanvas(VIDEO_WIDTH, VIDEO_HEIGHT);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("OffscreenCanvas 2D context is unavailable");
    }
    return {context, texture: new CanvasTexture(canvas)};
  });
  // A CanvasTexture holds a GPU texture that garbage collection doesn't free.
  useEffect(() => () => target.texture.dispose(), [target]);
  const {invalidate, advance} = useThree();
  const {isRendering} = useRemotionEnvironment();

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      target.context.drawImage(frame, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      target.texture.needsUpdate = true;
      // Frame extraction is async, so while rendering, <ThreeCanvas> has
      // already drawn this frame with the previous texture. Draw it again.
      if (isRendering) {
        advance(performance.now());
      } else {
        invalidate();
      }
    },
    [target, advance, invalidate, isRendering],
  );

  return (
    <>
      <Video src={staticFile("sample-clip.webm")} onVideoFrame={onVideoFrame} muted headless />
      <mesh position={[1.9, 0, 0]} rotation={[0, rotationY, 0]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshBasicMaterial map={target.texture} toneMapped={false} />
      </mesh>
    </>
  );
};
