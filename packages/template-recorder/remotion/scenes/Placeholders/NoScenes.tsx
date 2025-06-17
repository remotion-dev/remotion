import { AbsoluteFill } from "remotion";
import { REGULAR_FONT } from "../../../config/fonts";

const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flex: 1,
  ...REGULAR_FONT,
  fontSize: 36,
  gap: 10,
  flexDirection: "column",
};

export const NoScenes: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={container}>
        <div>No scenes defined for this video.</div>
        <div>Add a scene in the right sidebar -&gt;</div>
      </div>
    </AbsoluteFill>
  );
};
