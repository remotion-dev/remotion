import React, { ComponentType } from "react";
import { CompositionManagerContext } from "remotion";

const Mock: React.FC = () => null;

export const makeMockCompositionManagerContext =
  (): CompositionManagerContext => {
    return {
      currentCompositionMetadata: {
        durationInFrames: 100,
        fps: 30,
        height: 100,
        width: 100,
        props: {},
      },
      folders: [],
      setCurrentComposition: () => {},
      registerComposition: () => {},
      registerFolder: () => {},
      unregisterComposition: () => {},
      unregisterFolder: () => {},
      setCurrentCompositionMetadata: () => {},
      compositions: [
        {
          id: "markup",
          component: React.lazy(() =>
            Promise.resolve({
              default: Mock as ComponentType<unknown>,
            })
          ),
          nonce: 0,
          defaultProps: undefined,
          folderName: null,
          parentFolderName: null,
          schema: null,
          calculateMetadata: null,
          durationInFrames: 100,
          fps: 30,
          height: 100,
          width: 100,
        },
      ],
      currentComposition: "markup",
    };
  };
