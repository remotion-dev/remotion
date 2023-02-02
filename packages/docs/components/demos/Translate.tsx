import React from "react";
import { AbsoluteFill } from "remotion";

const Base: React.FC<{
  transform?: string;
  opacity?: number;
  showChip: boolean;
}> = ({ transform, opacity, showChip }) => {
  return (
    <AbsoluteFill
      style={{
        padding: 20,
        fontSize: 20,
        fontFamily: "GTPlanar",
      }}
    >
      {transform ? (
        <div>&quot;transform&quot;: &quot;{transform}&quot;</div>
      ) : null}
      {opacity === undefined ? null : <div>&quot;opacity&quot;: {opacity}</div>}
      <AbsoluteFill
        style={{
          opacity,
          transform,
        }}
      >
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 100,
              width: 100,
              backgroundColor: "var(--ifm-color-primary)",
              borderRadius: 10,
            }}
          />
        </AbsoluteFill>
        {showChip ? (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                fontSize: 14,
                width: 24,
                height: 24,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
                marginLeft: -50,
                marginTop: -50,
                fontWeight: "bold",
              }}
            >
              A
            </div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>{" "}
    </AbsoluteFill>
  );
};

export const TranslateDemo: React.FC<{
  translateX: number;
  translateY: number;
}> = ({ translateX: x, translateY: y }) => {
  return (
    <Base
      showChip={false}
      transform={`translateX(${x}px) translateY(${y}px)`}
    />
  );
};

export const RotateDemo: React.FC<{
  rotateZ: number;
}> = ({ rotateZ }) => {
  return <Base showChip transform={`rotateZ(${rotateZ}deg)`} />;
};

export const SkewDemo: React.FC<{
  skew: number;
}> = ({ skew }) => {
  return <Base showChip={false} transform={`skew(${skew}deg)`} />;
};

export const ScaleDemo: React.FC<{
  scale: number;
}> = ({ scale }) => {
  return <Base showChip transform={`scale(${scale})`} />;
};

export const OpacityDemo: React.FC<{
  opacity: number;
}> = ({ opacity }) => {
  return <Base showChip={false} opacity={opacity} />;
};
