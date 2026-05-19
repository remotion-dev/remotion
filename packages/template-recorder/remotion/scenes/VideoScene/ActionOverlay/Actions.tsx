import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { Cameras } from "../../../../config/scenes";
import { DeleteRecordingAction } from "./DeleteRecordingAction";
import {container} from './Actions-container';

const gradientSteps = [
  0, 0.013, 0.049, 0.104, 0.175, 0.259, 0.352, 0.45, 0.55, 0.648, 0.741, 0.825,
  0.896, 0.951, 0.987,
];

const gradientOpacities = [
  0, 8.1, 15.5, 22.5, 29, 35.3, 41.2, 47.1, 52.9, 58.8, 64.7, 71, 77.5, 84.5,
  91.9,
];

const globalGradientOpacity = 1;


export const Actions: React.FC<{
  cameras: Cameras;
  sceneIndex: number;
  visible: boolean;
}> = ({ cameras, sceneIndex, visible }) => {
  const { width } = useVideoConfig();

  const style: React.CSSProperties = useMemo(() => {
    return { width, ...container, opacity: visible ? 1 : 0 };
  }, [visible, width]);

  return (
    <div style={style}>
      <DeleteRecordingAction sceneIndex={sceneIndex} cameras={cameras} />
    </div>
  );
};
