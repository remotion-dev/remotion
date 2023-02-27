import React from "react";

import { interpolate } from "remotion";

const bestFramesPerLambdaParam = (frameCount: number) => {
  // Between 0 and 10 minutes (at 30fps), interpolate the concurrency from 75 to 150
  const concurrency = interpolate(frameCount, [0, 18000], [75, 150], {
    extrapolateRight: "clamp",
  });

  // At least have 20 as a `framesPerLambda` value
  const framesPerLambda = Math.max(frameCount / concurrency, 20);

  // Evenly distribute: For 21 frames over 2 lambda functions, distribute as 11 + 10 ==> framesPerLambda = 11
  const lambdasNeeded = Math.ceil(frameCount / framesPerLambda);

  return Math.ceil(frameCount / lambdasNeeded);
};

export const ConcurrencyCalculator: React.FC = () => {
  const [state, setState] = React.useState(900);
  const value = bestFramesPerLambdaParam(state);
  return (
    <div>
      Enter number of frames:{" "}
      <input
        type={"number"}
        placeholder="Number of frames"
        value={state}
        onChange={(e) => {
          setState(parseInt(e.target.value, 10));
        }}
      />
      <br />
      The default <code>framesPerLambda</code> is {value}
    </div>
  );
};
