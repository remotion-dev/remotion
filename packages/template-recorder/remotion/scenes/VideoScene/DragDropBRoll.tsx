import { updateDefaultProps, writeStaticFile } from "@remotion/studio";
import React from "react";
import { staticFile } from "remotion";
import {
  BRoll,
  SelectableScene,
  SelectableVideoScene,
} from "../../../config/scenes";

export const onBRollDropHandler = async ({
  e,
  composition,
  sceneIndex,
  from,
}: {
  e: React.DragEvent<HTMLDivElement>;
  composition: string;
  sceneIndex: number;
  from: number;
}) => {
  e.preventDefault();

  const bRolls: BRoll[] = [];
  for (const file of e.dataTransfer.files) {
    await writeStaticFile({
      contents: await file.arrayBuffer(),
      filePath: `${composition}/${file.name}`,
    });
    bRolls.push({
      source: staticFile(`${composition}/${file.name}`),
      durationInFrames: 100,
      from,
    });
  }

  updateDefaultProps({
    compositionId: composition,
    defaultProps: ({ unsavedDefaultProps }) => {
      const scenes = unsavedDefaultProps.scenes as SelectableScene[];
      const scene = scenes[sceneIndex] as SelectableVideoScene;

      const newScene: SelectableVideoScene = {
        ...scene,
        bRolls: bRolls,
      };

      return {
        ...unsavedDefaultProps,
        scenes: [
          ...scenes.slice(0, sceneIndex),
          newScene,
          ...scenes.slice(sceneIndex + 1),
        ],
      };
    },
  });
};

export const onBRollDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
};
