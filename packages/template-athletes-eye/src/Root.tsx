import { getVideoMetadata } from "@remotion/media-utils";
import { getStaticFiles } from "@remotion/studio";
import { Composition, staticFile } from "remotion";
import { AthletesEye, athletesEyeSchema } from "./AthletesEye";

const FPS = 30;
const DEFAULT_VIDEO_SRC = "http://remotion.media/gopro-small.mp4";
const DEFAULT_VIDEO_DURATION_IN_SECONDS = 30;
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];

const getDefaultVideoSrc = () => {
  return (
    getStaticFiles()
      .filter((file) => {
        return VIDEO_EXTENSIONS.some((extension) =>
          file.name.toLowerCase().endsWith(extension),
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name))[0]?.src ?? DEFAULT_VIDEO_SRC
  );
};

export const RemotionRoot: React.FC = () => {
  const defaultVideoSrc = getDefaultVideoSrc();

  return (
    <Composition
      calculateMetadata={async ({ props }) => {
        if (props.durationInSeconds) {
          return {
            durationInFrames: Math.max(
              1,
              Math.floor(props.durationInSeconds * FPS),
            ),
            fps: FPS,
          };
        }

        if (props.videoSrc === DEFAULT_VIDEO_SRC) {
          return {
            durationInFrames: Math.floor(
              DEFAULT_VIDEO_DURATION_IN_SECONDS * FPS,
            ),
            fps: FPS,
          };
        }

        const metadata = await getVideoMetadata(props.videoSrc);

        return {
          durationInFrames: Math.max(
            1,
            Math.floor(metadata.durationInSeconds * FPS),
          ),
          fps: FPS,
        };
      }}
      component={AthletesEye}
      defaultProps={{
        accentColor: "#0D96FF",
        gpxSrc: staticFile("testing.gpx"),
        videoSrc: defaultVideoSrc,
      }}
      fps={FPS}
      height={1920}
      id="AthletesEye"
      schema={athletesEyeSchema}
      width={1080}
    />
  );
};
