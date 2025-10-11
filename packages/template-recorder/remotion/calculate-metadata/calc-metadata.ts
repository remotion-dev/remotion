import type { CalculateMetadataFunction } from "remotion";
import { FPS } from "../../config/fps";
import type { MainProps } from "../Main";
import { getDimensionsForLayout } from "../layout/dimensions";
import { addChaptersToScenesAndMetadata } from "./add-chapters-to-scenes";
import { addDurationsToScenes } from "./add-durations-to-scenes";
import { addMetadataToScene } from "./add-metadata-to-scene";
import { getAllCameras } from "./get-camera";

export const calcMetadata: CalculateMetadataFunction<MainProps> = async ({
  props,
  compositionId,
}) => {
  const { hasAtLeast1Camera, scenesWithCameras } = getAllCameras({
    compositionId,
    scenes: props.scenes,
  });

  const withMetadata = await Promise.all(
    scenesWithCameras.map(({ scene, cameras }) =>
      addMetadataToScene({
        scene,
        cameras,
        hasAtLeast1Camera,
        allScenes: props.scenes,
        canvasLayout: props.canvasLayout,
      }),
    ),
  );

  const {
    totalDurationInFrames: durationInFrames,
    scenesAndMetadataWithDuration: withDurations,
  } = addDurationsToScenes(withMetadata, props.canvasLayout);

  const withChapters = addChaptersToScenesAndMetadata(withDurations);

  const { height, width } = getDimensionsForLayout(props.canvasLayout);

  return {
    durationInFrames,
    height,
    width,
    fps: FPS,
    props: {
      ...props,
      scenesAndMetadata: withChapters,
    },
  };
};
