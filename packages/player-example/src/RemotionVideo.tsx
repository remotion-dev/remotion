import React, { FunctionComponent } from "react";
import { Composition } from "remotion";
import CarSlideshow from "./CarSlideshow";

const RemotionVideo: FunctionComponent = () => {
  return (
    <>
      <Composition
        id="car-slideshow"
        component={CarSlideshow}
        width={768}
        height={432}
        fps={30}
        durationInFrames={500}
      />
    </>
  );
};

export default RemotionVideo;