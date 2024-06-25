import React, { useCallback, useState } from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Cards } from "./Card";

export const schema = z.object({
  theme: z.enum(["light", "dark"]),
});

export const Comp: React.FC<z.infer<typeof schema>> = ({ theme }) => {
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
        backgroundColor: theme === "dark" ? "#222" : "white",
      }}
    >
      <Cards
        key={state.rerenders}
        onUpdate={onUpdate}
        indices={state.indices}
        theme={theme}
      />
    </AbsoluteFill>
  );
};
