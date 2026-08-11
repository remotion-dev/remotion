import { AbsoluteFill, useVideoConfig } from "remotion";
import { MONOSPACE_FONT, REGULAR_FONT } from "../../../config/fonts";
import { SERVER_PORT } from "../../../config/server";
import { COLORS } from "../../../config/themes";

const container: React.CSSProperties = {
  ...REGULAR_FONT,
  fontSize: 36,
  padding: 60,
  flexDirection: "column",
  lineHeight: 1.5,
  width: 1080,
  margin: "auto",
  justifyContent: "center",
};

const accent: React.CSSProperties = {
  ...MONOSPACE_FONT,
  color: COLORS.light.ACCENT_COLOR,
};

const link: React.CSSProperties = {
  color: COLORS.light.ACCENT_COLOR,
  borderBottom: "4px solid " + COLORS.light.ACCENT_COLOR,
  textDecoration: "none",
};

export const NoRecordingsScene: React.FC<{ type: "none" | "no-more" }> = ({
  type,
}) => {
  const { id } = useVideoConfig();
  const url = `http://localhost:${SERVER_PORT}?folder=${id}`;

  return (
    <AbsoluteFill style={container}>
      <p>
        This is a video scene but there are no{" "}
        {type === "no-more" ? "more" : null} recordings in the
        <span style={accent}> public/{id} </span>
        folder.
      </p>
      <br />
      <div>Possible solutions:</div>
      <ol>
        <li>
          <a href={url} target="_blank" style={link}>
            Make
          </a>{" "}
          a new recording or add a new video{" "}
          <a
            target="_blank"
            href="https://www.remotion.dev/docs/recorder/external-recordings"
            style={link}
          >
            manually
          </a>
          .
        </li>
        <li>
          Switch this scene to a different type, e.g.{" "}
          <code style={accent}>&quot;title&quot;</code>
        </li>
        <li>Delete this scene.</li>
      </ol>
    </AbsoluteFill>
  );
};
