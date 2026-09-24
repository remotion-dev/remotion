import { deleteStaticFile, saveDefaultProps } from "@remotion/studio";
import React, { useCallback } from "react";
import { useVideoConfig } from "remotion";
import { z } from "zod";
import { Cameras, videoConf } from "../../../../config/scenes";
import { ActionContainer } from "./Action";

export const DeleteRecordingAction: React.FC<{
  cameras: Cameras;
  sceneIndex: number;
}> = ({ cameras, sceneIndex }) => {
  const { id } = useVideoConfig();
  const onClick = useCallback(async () => {
    const filesToDelete = [
      cameras.webcam.name,
      cameras.display && cameras.display.name,
      cameras.captions && cameras.captions.name,
      cameras.alternative1 && cameras.alternative1.name,
      cameras.alternative2 && cameras.alternative2.name,
    ].filter(Boolean) as string[];
    if (
      !confirm(
        `This will remove ${filesToDelete.join(", ")} from the file system and delete the scene. Do you want to proceed?`,
      )
    ) {
      return;
    }

    await Promise.all(
      [
        ...filesToDelete.map((f) => deleteStaticFile(f)),
        saveDefaultProps({
          compositionId: id,
          defaultProps: ({ unsavedDefaultProps }) => {
            const typedProps = unsavedDefaultProps as z.infer<typeof videoConf>;
            const returnValue: z.infer<typeof videoConf> = {
              ...typedProps,
              scenes: typedProps.scenes.filter((s, i) => i !== sceneIndex),
            };
            return returnValue;
          },
        }),
      ].filter(Boolean),
    );
  }, [
    cameras.alternative1,
    cameras.alternative2,
    cameras.captions,
    cameras.display,
    cameras.webcam.name,
    id,
    sceneIndex,
  ]);

  return (
    <ActionContainer onClick={onClick}>
      <svg
        style={{
          height: 24,
        }}
        viewBox="0 0 448 512"
      >
        <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
      </svg>
      Delete recording
    </ActionContainer>
  );
};
