import type { CanvasLayout, Dimensions } from "../../config/layout";
import { getSafeSpace } from "../../config/layout";
import type { SceneVideos, WebcamPosition } from "../../config/scenes";
import { isWebCamAtBottom } from "../animations/webcam-transitions/helpers";
import { getDimensionsForLayout } from "./dimensions";
import { getCaptionsLayout } from "./get-captions-layout";
import {
  getLandscapeDisplayAndWebcamLayout,
  getSquareBRollLayout,
  getSquareDisplayLayout,
} from "./get-display-layout";
import { getDisplaySize } from "./get-display-size";
import { getNonFullscreenWebcamSize } from "./get-webcam-size";
import type {
  BRollEnterDirection,
  BRollType,
  Layout,
  RecordingsLayout,
} from "./layout-types";

export const borderRadius = 20;

const squareFullscreenWebcamLayout = ({
  canvasSize,
  webcamSize,
  webcamPosition,
}: {
  canvasSize: Dimensions;
  webcamSize: Dimensions;
  webcamPosition: WebcamPosition;
}): {
  webcamLayout: Layout;
  bRollLayout: Layout;
  bRollEnterDirection: BRollEnterDirection;
} => {
  const aspectRatio = webcamSize.width / webcamSize.height;

  const maxWidth = canvasSize.width - getSafeSpace("square") * 2;
  // Video can take up 75% of the height to leave place for the subtitles
  const maxHeight = (canvasSize.height - getSafeSpace("square") * 2) * 0.75;

  const provisionalHeight = maxWidth / aspectRatio;
  const width =
    provisionalHeight > maxHeight ? maxHeight * aspectRatio : maxWidth;
  const height = width / aspectRatio;

  const left = (canvasSize.width - width) / 2;
  const top = isWebCamAtBottom(webcamPosition)
    ? canvasSize.height - height - getSafeSpace("square")
    : getSafeSpace("square");

  const webcamLayout: Layout = {
    left,
    top,
    width,
    height,
    borderRadius,
    opacity: 1,
  };

  const bRollLayout: Layout = {
    left: getSafeSpace("square"),
    top,
    width: canvasSize.width - getSafeSpace("square") * 2,
    height,
    borderRadius,
    opacity: 1,
  };

  return {
    webcamLayout,
    bRollLayout,
    bRollEnterDirection: isWebCamAtBottom(webcamPosition) ? "bottom" : "top",
  };
};

export const fullscreenLayout = (canvasSize: Dimensions): Layout => {
  return {
    ...canvasSize,
    left: 0,
    top: 0,
    borderRadius: 0,
    opacity: 1,
  };
};

const getSquareBentoBoxWebcamLayout = ({
  webcamSize,
  webcamPosition,
  canvasSize,
}: {
  webcamSize: Dimensions;
  webcamPosition: WebcamPosition;
  canvasSize: Dimensions;
}): Layout => {
  if (webcamPosition === "bottom-right") {
    return {
      ...webcamSize,
      left: canvasSize.width - webcamSize.width - getSafeSpace("square"),
      top: canvasSize.height - webcamSize.height - getSafeSpace("square"),
      borderRadius,
      opacity: 1,
    };
  }

  if (webcamPosition === "bottom-left") {
    return {
      ...webcamSize,
      left: getSafeSpace("square"),
      top: canvasSize.height - webcamSize.height - getSafeSpace("square"),
      borderRadius,
      opacity: 1,
    };
  }

  if (webcamPosition === "top-left") {
    return {
      ...webcamSize,
      left: getSafeSpace("square"),
      top: getSafeSpace("square"),
      borderRadius,
      opacity: 1,
    };
  }

  if (webcamPosition === "top-right") {
    return {
      ...webcamSize,
      left: canvasSize.width - webcamSize.width - getSafeSpace("square"),
      top: getSafeSpace("square"),
      borderRadius,
      opacity: 1,
    };
  }

  return {
    height: webcamSize.height,
    width: webcamSize.width,
    left: 0,
    top: 0,
    borderRadius,
    opacity: 1,
  };
};

const getFullScreenWebcamSize = ({
  webcamVideoResolution,
  canvasSize,
  canvasLayout,
}: {
  webcamVideoResolution: Dimensions;
  canvasSize: Dimensions;
  canvasLayout: CanvasLayout;
}) => {
  const aspectRatio =
    webcamVideoResolution.width / webcamVideoResolution.height;

  const actualWidth = canvasSize.width - getSafeSpace(canvasLayout) * 2;

  const actualHeight = actualWidth / aspectRatio;

  return {
    height: actualHeight,
    width: actualWidth,
  };
};

export type VideoSceneLayout = {
  webcamLayout: Layout;
  displayLayout: Layout | null;
  bRollLayout: Layout;
  bRollType: BRollType;
  subtitleLayout: Layout | null;
  bRollEnterDirection: BRollEnterDirection;
};

const getDisplayAndWebcamLayout = ({
  canvasSize,
  webcamPosition,
  canvasLayout,
  videos,
}: {
  canvasSize: Dimensions;
  webcamPosition: WebcamPosition;
  canvasLayout: CanvasLayout;
  videos: SceneVideos;
}): RecordingsLayout => {
  if (!videos.display) {
    if (canvasLayout === "square") {
      const fullscreenWebcamSize = getFullScreenWebcamSize({
        canvasSize,
        canvasLayout,
        webcamVideoResolution: videos.webcam,
      });

      const { webcamLayout, bRollLayout, bRollEnterDirection } =
        squareFullscreenWebcamLayout({
          canvasSize,
          webcamPosition,
          webcamSize: fullscreenWebcamSize,
        });

      return {
        displayLayout: null,
        webcamLayout,
        bRollLayout,
        bRollEnterDirection,
      };
    }

    if (canvasLayout === "landscape") {
      const webcamLayout = fullscreenLayout(canvasSize);
      const bRollLayout = fullscreenLayout(canvasSize);

      return {
        displayLayout: null,
        bRollLayout,
        webcamLayout,
        bRollEnterDirection: "top",
      };
    }

    throw new Error(`Unknown canvas layout: ${canvasLayout satisfies never}`);
  }

  const displaySize = getDisplaySize({
    canvasLayout,
    canvasSize,
    videoHeight: videos.display.height,
    videoWidth: videos.display.width,
  });

  const webcamSize: Dimensions = getNonFullscreenWebcamSize({
    canvasSize,
    canvasLayout,
    displaySize,
  });

  if (canvasLayout === "square") {
    const displayLayout = getSquareDisplayLayout({
      canvasSize,
      webcamPosition,
      displaySize,
    });

    const { bRollLayout, bRollEnterDirection } = getSquareBRollLayout({
      canvasSize,
      displaySize,
      webcamPosition,
    });

    const webcamLayout = getSquareBentoBoxWebcamLayout({
      webcamPosition,
      canvasSize,
      webcamSize,
    });

    return {
      displayLayout,
      webcamLayout,
      bRollLayout,
      bRollEnterDirection,
    };
  }

  if (canvasLayout === "landscape") {
    return getLandscapeDisplayAndWebcamLayout({
      webcamSize,
      canvasLayout,
      canvasSize,
      webcamPosition,
    });
  }

  throw new Error(`Unknown canvas layout: ${canvasLayout satisfies never}`);
};

export const getVideoSceneLayout = ({
  canvasLayout,
  videos,
  webcamPosition: webcamPosition,
}: {
  videos: SceneVideos;
  canvasLayout: CanvasLayout;
  webcamPosition: WebcamPosition;
}): VideoSceneLayout => {
  const canvasSize = getDimensionsForLayout(canvasLayout);

  const { displayLayout, webcamLayout, bRollLayout, bRollEnterDirection } =
    getDisplayAndWebcamLayout({
      canvasSize,
      webcamPosition,
      canvasLayout,
      videos,
    });

  const subtitleLayout = getCaptionsLayout({
    canvasLayout,
    canvasSize,
    displayLayout,
    webcamLayout,
    webcamPosition: webcamPosition,
  });

  const bRollType =
    canvasLayout === "landscape" && videos.display === null ? "fade" : "scale";

  return {
    displayLayout,
    webcamLayout,
    bRollLayout,
    subtitleLayout,
    bRollEnterDirection,
    bRollType,
  };
};
