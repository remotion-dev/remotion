import React, { useCallback, useState } from "react";

export const ActionContainer: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const onPointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <button
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      type="button"
      style={{
        height: 100,
        width: 150,
        fontSize: 16,
        fontFamily: "sans-serif",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        textAlign: "center",
        paddingTop: 20,
        gap: 10,
        cursor: "pointer",
        appearance: "none",
        border: "none",
        borderRadius: 0,
        background: "none",
        color: "black",
        opacity: hovered ? 1 : 0.8,
      }}
    >
      {children}
    </button>
  );
};
