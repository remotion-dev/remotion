import { useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { CanvasTexture, Texture } from "three";
import {
  CAMERA_DISTANCE,
  PHONE_CURVE_SEGMENTS,
  PHONE_SHININESS,
  PhoneLayout,
} from "./helpers/layout";
import { roundedRect } from "./helpers/rounded-rectangle";
import { RoundedBox } from "./RoundedBox";
import { MediabunnyMetadata } from "./helpers/get-media-metadata";

export const Phone: React.FC<{
  readonly phoneColor: string;
  readonly phoneLayout: PhoneLayout;
  readonly mediaMetadata: MediabunnyMetadata;
  readonly videoSrc: string;
}> = ({ phoneColor, phoneLayout, mediaMetadata, videoSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Place a camera and set the distance to the object.
  // Then make it look at the object.
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.near = 0.2;
    camera.far = Math.max(5000, CAMERA_DISTANCE * 2);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // During the whole scene, the phone is rotating.
  // 2 * Math.PI is a full rotation.
  const constantRotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, Math.PI * 6],
  );

  // When the composition starts, there is some extra
  // rotation and translation.
  const entranceAnimation = spring({
    frame,
    fps,
    config: {
      damping: 200,
      mass: 3,
    },
  });

  // Calculate the entrance rotation,
  // doing one full spin
  const entranceRotation = interpolate(
    entranceAnimation,
    [0, 1],
    [-Math.PI, Math.PI],
  );

  // Calculating the total rotation of the phone
  const rotateY = entranceRotation + constantRotation;

  // Calculating the translation of the phone at the beginning.
  // The start position of the phone is set to 4 "units"
  const translateY = interpolate(entranceAnimation, [0, 1], [-4, 0]);

  // Calculate a rounded rectangle for the phone screen
  const screenGeometry = useMemo(() => {
    return roundedRect({
      width: phoneLayout.screen.width,
      height: phoneLayout.screen.height,
      radius: phoneLayout.screen.radius,
    });
  }, [
    phoneLayout.screen.height,
    phoneLayout.screen.radius,
    phoneLayout.screen.width,
  ]);

  const [canvasTexture] = useState(() => {
    return new OffscreenCanvas(
      mediaMetadata.dimensions.width,
      mediaMetadata.dimensions.height,
    );
  });

  const [context] = useState(() => {
    const context = canvasTexture.getContext("2d");
    if (!context) {
      throw new Error("Failed to get context");
    }
    return context;
  });

  const [texture] = useState<Texture>(() => {
    const tex = new CanvasTexture(canvasTexture);
    tex.repeat.y = 1 / phoneLayout.screen.height;
    tex.repeat.x = 1 / phoneLayout.screen.width;
    return tex;
  });

  const { invalidate } = useThree();

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      context.drawImage(frame, 0, 0);
      texture.needsUpdate = true;
      invalidate();
    },
    [context, texture, invalidate],
  );

  return (
    <group
      scale={entranceAnimation}
      rotation={[0, rotateY, 0]}
      position={[0, translateY, 0]}
    >
      <Video src={videoSrc} onVideoFrame={onVideoFrame} headless muted />

      <RoundedBox
        radius={phoneLayout.phone.radius}
        depth={phoneLayout.phone.thickness}
        curveSegments={PHONE_CURVE_SEGMENTS}
        position={phoneLayout.phone.position}
        width={phoneLayout.phone.width}
        height={phoneLayout.phone.height}
      >
        <meshPhongMaterial color={phoneColor} shininess={PHONE_SHININESS} />
      </RoundedBox>
      <mesh position={phoneLayout.screen.position}>
        <shapeGeometry args={[screenGeometry]} />
        <meshBasicMaterial color={0xffffff} toneMapped={false} map={texture} />
      </mesh>
    </group>
  );
};
