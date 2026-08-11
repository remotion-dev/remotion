import { AbsoluteFill } from "remotion";
import { REGULAR_FONT } from "../config/fonts";
import { SERVER_PORT } from "../config/server";
import { COLORS } from "../config/themes";
import { WaitForFonts } from "./helpers/WaitForFonts";

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
  fontSize: 30,
  textAlign: "center",
  ...REGULAR_FONT,
};

const link: React.CSSProperties = {
  color: COLORS.light.ACCENT_COLOR,
  textDecoration: "underline",
};

export const GoToRecorder: React.FC = () => {
  return (
    <WaitForFonts>
      <AbsoluteFill style={container}>
        The recording interface is running on http://localhost:{SERVER_PORT}.
        <a
          target="_blank"
          style={link}
          href={`http://localhost:${SERVER_PORT}`}
        >
          Go there
        </a>
      </AbsoluteFill>
    </WaitForFonts>
  );
};
