import React from "react";
import { Folder, Still } from "remotion";
import { articles } from "../data/articles";
import { experts } from "../data/experts";
import { Article } from "./Article";
import { Expert } from "./Expert";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Folder name="articles">
        {articles.map((e) => {
          return (
            <Still
              key={e.compId}
              component={Article}
              defaultProps={{
                articleRelativePath: e.relativePath,
              }}
              height={630}
              width={1200}
              id={e.compId}
            />
          );
        })}
      </Folder>
    </>
  );
};
