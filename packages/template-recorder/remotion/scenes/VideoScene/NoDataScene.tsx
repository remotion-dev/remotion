import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { MONOSPACE_FONT, REGULAR_FONT } from "../../../config/fonts";
import { COLORS } from "../../../config/themes";

const textWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  gap: 10,
  ...REGULAR_FONT,
  fontSize: 40,
};

export const NoDataScene: React.FC<{
  theme: "light" | "dark";
}> = ({ theme }) => {
  const spanStyle: React.CSSProperties = useMemo(() => {
    return {
      color: COLORS[theme].ACCENT_COLOR,
      ...MONOSPACE_FONT,
    };
  }, [theme]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS[theme].BACKGROUND }}>
      <div style={textWrapper}>
        <div style={{ padding: 100 }}>
          No <span style={spanStyle}>scene</span> defined yet?
          <br /> Add a new one in the right side bar.
        </div>
      </div>
    </AbsoluteFill>
  );
};
