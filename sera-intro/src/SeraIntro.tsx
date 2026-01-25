import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

export const SeraIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation - scale and fade in
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline animation - slide up and fade in
  const taglineY = spring({
    frame: frame - 40,
    fps,
    from: 50,
    to: 0,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Description animation - slide up and fade in
  const descriptionY = spring({
    frame: frame - 70,
    fps,
    from: 50,
    to: 0,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const descriptionOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Fade out everything at the end
  const fadeOut = interpolate(frame, [140, 160], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ opacity: fadeOut }}>
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SeraLogo />
        </div>

        {/* Tagline */}
        <Sequence from={40}>
          <div
            style={{
              transform: `translateY(${taglineY}px)`,
              opacity: taglineOpacity,
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#2563eb',
                margin: 0,
              }}
            >
              Neuroadaptive Work Management
            </h1>
          </div>
        </Sequence>

        {/* Description */}
        <Sequence from={70}>
          <div
            style={{
              transform: `translateY(${descriptionY}px)`,
              opacity: descriptionOpacity,
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            <p
              style={{
                fontSize: '32px',
                color: '#333',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Sustainable productivity without burning out
            </p>
          </div>
        </Sequence>

        {/* Website */}
        <Sequence from={100}>
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              opacity: interpolate(frame, [100, 120], [0, 1], {
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <p
              style={{
                fontSize: '24px',
                color: '#666',
                margin: 0,
              }}
            >
              serainclusion.com
            </p>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

// SVG Logo Component - recreated based on the Sera logo
const SeraLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Logo Icon */}
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Blue circle background */}
        <circle cx="50" cy="50" r="50" fill="#2563eb" />
        {/* Two bookmark/page shapes */}
        <rect x="25" y="30" width="15" height="40" rx="3" fill="white" />
        <rect x="60" y="30" width="15" height="40" rx="3" fill="white" />
      </svg>

      {/* Logo Text */}
      <div
        style={{
          fontSize: '80px',
          fontWeight: 'bold',
          color: '#000',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        sera
      </div>
    </div>
  );
};
