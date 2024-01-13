import React, { useCallback, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Cards } from "./Card";

export const Comp: React.FC = () => {
  const [state, setRerenders] = useState({
    rerenders: 0,
    indices: [0, 1, 2, 3],
  });

  const onUpdate = useCallback((newIndices: number[]) => {
    setRerenders((i) => ({
      indices: newIndices,
      rerenders: i.rerenders + 1,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
      }}
    >
      <Cards
        key={state.rerenders}
        onUpdate={onUpdate}
        indices={state.indices}
      />
    </AbsoluteFill>
  );
};
