import React from "react";
import { AbsoluteFill } from "remotion";

const Base: React.FC<{
  readonly transform?: string;
  readonly opacity?: number;
  readonly showChip: boolean;
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
                color: "var(--ifm-color-primary)",
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
  readonly translateX: number;
  readonly translateY: number;
}> = ({ translateX: x, translateY: y }) => {
  return (
    <Base
      showChip={false}
      transform={`translateX(${x}px) translateY(${y}px)`}
    />
  );
};

export const RotateDemo: React.FC<{
  readonly rotateZ: number;
}> = ({ rotateZ }) => {
  return <Base showChip transform={`rotateZ(${rotateZ}deg)`} />;
};

export const SkewDemo: React.FC<{
  readonly skew: number;
}> = ({ skew }) => {
  return <Base showChip={false} transform={`skew(${skew}deg)`} />;
};

export const ScaleDemo: React.FC<{
  readonly scale: number;
}> = ({ scale }) => {
  return <Base showChip transform={`scale(${scale})`} />;
};

export const OpacityDemo: React.FC<{
  readonly opacity: number;
}> = ({ opacity }) => {
  return <Base showChip={false} opacity={opacity} />;
};
