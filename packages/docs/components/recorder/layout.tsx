import React, { useMemo } from "react";

const rectangleStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgb(128, 128, 128)",
  color: "white",
  border: "1px solid #71777f",
};

export const Layout: React.FC<{
  readonly type: "landscape" | "portrait" | "square";
  readonly aspectWidth: number;
  readonly aspectHeight: number;
}> = ({ type, aspectWidth, aspectHeight }) => {
  const aspectRatioStyle: React.CSSProperties = useMemo(() => {
    if (type === "landscape") {
      return {
        ...rectangleStyle,
        width: 320,
        height: 180,
      };
    }

    if (type === "portrait") {
      return {
        ...rectangleStyle,
        width: (180 / 16) * 9,
        height: 180,
      };
    }

    return {
      ...rectangleStyle,
      width: 180,
      height: 180,
    };
  }, [type]);

  return (
    <div style={aspectRatioStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: "bold" }}>{type}</div>
        {aspectWidth}x{aspectHeight}
      </div>
    </div>
  );
};
