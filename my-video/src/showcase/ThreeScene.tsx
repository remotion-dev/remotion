import {ThreeCanvas} from "@remotion/three";
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/three's <ThreeCanvas>, a react-three-fiber root
// that (unlike a plain <Canvas>) is driven by useCurrentFrame() instead of
// requestAnimationFrame — required so a render captures each frame
// deterministically rather than whatever state the R3F clock happened to be
// in. Sequences inside it need layout="none" per the 3d.md guide.
export const ThreeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const rotationY = frame * 0.06;
  const rotationX = Math.sin(frame / fps) * 0.3;

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26, zIndex: 1}}>
        @remotion/three · react-three-fiber, seeked by useCurrentFrame()
      </div>
      <ThreeCanvas width={1280} height={720}>
        <Sequence layout="none">
          <ambientLight intensity={0.6} />
          <pointLight position={[4, 4, 4]} intensity={40} color="#22d3ee" />
          <mesh rotation={[rotationX, rotationY, 0]}>
            <boxGeometry args={[2.4, 2.4, 2.4]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
        </Sequence>
      </ThreeCanvas>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        Full 3D scenes, frame-accurate
      </div>
    </AbsoluteFill>
  );
};
