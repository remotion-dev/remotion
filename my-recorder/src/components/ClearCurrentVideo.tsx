import React, { useCallback, useMemo, useState } from "react";

export const ClearCurrentVideo: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);

  const onPointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const style: React.CSSProperties = useMemo(() => {
    return {
      background: hovered ? "rgba(0, 0, 0, 0.5)" : "transparent",
      paddingLeft: 10,
      paddingRight: 10,
      height: "100%",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  }, [hovered]);

  return (
    <div
      onClick={onClick}
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <svg viewBox="0 0 384 512" style={{ width: 13 }}>
        <path
          fill={hovered ? "white" : "rgba(255, 255, 255, 0.5)"}
          d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
        />
      </svg>
    </div>
  );
};
