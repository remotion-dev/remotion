import {Composition} from "remotion";
import {HelloWorld} from "./HelloWorld";
import type {HelloWorldProps} from "./types";

const defaultProps: HelloWorldProps = {
  titleText: "Hello from Electron",
};

export const RemotionRoot: React.FC = () => {
  

  return (
    <Composition
      id="HelloWorld"
      component={HelloWorld}
      durationInFrames={120}
      fps={30}
      width={1280}
      height={720}
      defaultProps={defaultProps}
    />
  );
};
