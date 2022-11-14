import React from "react";
import { Folder, Still } from "remotion";
import { experts } from "../data/experts";
import { Expert } from "./Expert";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="experts">
      {experts.map((e) => {
        return (
          <Still
            key={e.slug}
            component={Expert}
            defaultProps={{
              expertId: e.slug,
            }}
            height={630}
            width={1200}
            id={`experts-${e.slug}`}
          />
        );
      })}
    </Folder>
  );
};
