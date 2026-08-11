import { RemotionExample } from "./index";

export const fallingSpheresCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const spheres = [
    { x: -1.5, z: -0.5, delay: 0, radius: 0.4, restitution: 0.75 },
    { x: 0, z: 0, delay: 20, radius: 0.5, restitution: 0.75 },
    { x: 1.5, z: 0.5, delay: 40, radius: 0.35, restitution: 0.75 },
    { x: -0.8, z: 1, delay: 60, radius: 0.45, restitution: 0.75 },
    { x: 0.8, z: -1, delay: 80, radius: 0.38, restitution: 0.75 },
  ];

  const gravity = 12;
  const groundY = -2;

  // Realistic bounce physics simulation
  const simulateBounce = (f: number, delay: number, radius: number, restitution: number) => {
    const elapsed = Math.max(0, f - delay);
    const t = elapsed / fps;
    const startY = 6;
    const surfaceY = groundY + radius;

    // Calculate time to first impact
    const firstImpactTime = Math.sqrt(2 * (startY - surfaceY) / gravity);

    if (t <= firstImpactTime) {
      const y = startY - 0.5 * gravity * t * t;
      return { y, squash: 1 };
    }

    // After first impact, simulate bounces
    let currentVelocity = gravity * firstImpactTime;
    let bounceStartTime = firstImpactTime;

    for (let bounce = 0; bounce < 20; bounce++) {
      currentVelocity *= restitution;

      if (currentVelocity < 0.5) {
        return { y: surfaceY, squash: 1 };
      }

      const bounceDuration = 2 * currentVelocity / gravity;
      const timeInBounce = t - bounceStartTime;

      if (timeInBounce <= bounceDuration) {
        const y = surfaceY + currentVelocity * timeInBounce - 0.5 * gravity * timeInBounce * timeInBounce;
        const impactProximity = Math.abs(y - surfaceY);
        const squash = impactProximity < 0.08 ? 0.65 + (impactProximity / 0.08) * 0.35 : 1;
        return { y: Math.max(surfaceY, y), squash };
      }

      bounceStartTime += bounceDuration;
    }

    return { y: surfaceY, squash: 1 };
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 3, 8], fov: 40 }}
      >
        <ambientLight intensity={0.05} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
        </mesh>

        {spheres.map((sphere, i) => {
          const { y, squash } = simulateBounce(frame, sphere.delay, sphere.radius, sphere.restitution);
          const stretch = 1 / squash;

          return (
            <group key={i} position={[sphere.x, y, sphere.z]}>
              <pointLight
                color="#ffd700"
                intensity={0.8}
                distance={4}
                decay={2}
              />
              {/* Golden sphere */}
              <mesh scale={[1, squash, stretch]}>
                <sphereGeometry args={[sphere.radius, 32, 32]} />
                <meshStandardMaterial
                  color="#ffd700"
                  emissive="#cc7a00"
                  emissiveIntensity={0.15}
                  metalness={0.4}
                  roughness={0.6}
                />
              </mesh>
            </group>
          );
        })}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};`;

export const fallingSpheresExample: RemotionExample = {
  id: "falling-spheres",
  name: "Golden Bouncing Spheres",
  description: "Glowing golden spheres with physics and orbiting camera",
  category: "3D",
  durationInFrames: 450,
  fps: 60,
  code: fallingSpheresCode,
};
