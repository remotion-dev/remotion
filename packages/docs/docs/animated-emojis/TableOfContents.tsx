import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/animated-emojis/animated-emoji">
          <strong>{"<AnimatedEmoji>"}</strong>
          <div>
            Component for rendering an animated emoji.
          </div>
        </TOCItem>
        <TOCItem link="/docs/animated-emojis/get-available-emojis">
          <strong>{"getAvailableEmojis()"}</strong>
          <div>Get a list of available emojis.</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
