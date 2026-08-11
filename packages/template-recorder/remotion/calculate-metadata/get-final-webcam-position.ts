import { CanvasLayout } from "../../config/layout";
import {
  Cameras,
  SelectableScene,
  SelectableVideoScene,
  WebcamPosition,
} from "../../config/scenes";

export const getFinalWebcamPosition = ({
  scenes,
  scene,
  cameras,
  canvasLayout,
}: {
  scenes: SelectableScene[];
  scene: SelectableVideoScene;
  cameras: Cameras;
  canvasLayout: CanvasLayout;
}): WebcamPosition => {
  if (!cameras.display && canvasLayout === "landscape") {
    return "center";
  }

  let idx = scenes.findIndex((s) => s === scene);

  let webcamPosition = scene.webcamPosition;

  while (webcamPosition === "previous" && idx >= 0) {
    const prevScene = scenes[idx] as SelectableScene;
    if (prevScene.type === "videoscene") {
      webcamPosition = prevScene.webcamPosition;
    }

    if (webcamPosition === "previous" && idx === 0) {
      webcamPosition = "top-left";
    }

    idx -= 1;
  }

  if (webcamPosition === "previous") {
    throw new Error('Invalid webcam position "previous"');
  }

  return webcamPosition;
};
