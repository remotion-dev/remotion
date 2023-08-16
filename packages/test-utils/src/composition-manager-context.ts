import React, { ComponentType, useContext } from "react";
import { CompositionManagerContext, Internals } from "remotion";

const Mock: React.FC = () => null;

export const makeMockCompositionManagerContext =
  (): CompositionManagerContext => {
    const compositions = useContext(Internals.CompositionManager);

    return {
      ...compositions,
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
