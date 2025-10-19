import { Composition } from "remotion";
import { AIVideo, aiVideoSchema } from "./AIVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={aiVideoSchema}
        defaultProps={{}}
      />
    </>
  );
};
