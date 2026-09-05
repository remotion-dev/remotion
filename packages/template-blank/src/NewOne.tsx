import { MyComponent } from "./Composition";
import { Sequence } from "remotion";
import React from "react";

export const NewOne: React.FC = () => {
  return (
    <>
      <Sequence
        name="MyComp"
        width={1280}
        height={720}
        durationInFrames={90}
        style={{
          position: "absolute",
          translate: "366.9px 125px",
        }}
      >
        <MyComponent />
      </Sequence>
    </>
  );
};
