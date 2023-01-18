import { NoiseComp } from "./NoiseDemo";
import { TriangleDemo } from "./Triangle";

export type Option = { name: string } & (
  | {
      type: "numeric";
      min: number;
      default: number;
      max: number;
      step: number;
    }
  | {
      type: "boolean";
      default: boolean;
      max: number;
      step: number;
    }
);

export type DemoType = {
  id: string;
  comp: React.FC;
  compWidth: number;
  compHeight: number;
  fps: number;
  durationInFrames: number;
  options: Option[];
  autoPlay: boolean;
};

export const triangleDemo: DemoType = {
  comp: TriangleDemo,
  compWidth: 1280,
  compHeight: 400,
  durationInFrames: 150,
  fps: 30,
  id: "triangle",
  autoPlay: false,
  options: [
    {
      default: 200,
      max: 1000,
      step: 5,
      min: 1,
      type: "numeric",
      name: "length",
    },
    {
      name: "edgeRoundness",
      default: 1,
      max: 2,
      min: -2,
      step: 0.01,
      type: "numeric",
    },
  ],
};

export const noiseDemo: DemoType = {
  comp: NoiseComp,
  compHeight: 720,
  compWidth: 1280,
  durationInFrames: 150,
  fps: 30,
  id: "noise",
  autoPlay: true,
  options: [
    {
      default: 0.01,
      max: 0.025,
      min: 0.001,
      step: 0.001,
      type: "numeric",
      name: "speed",
    },
    {
      min: 0,
      max: 100,
      step: 1,
      default: 50,
      name: "maxOffset",
      type: "numeric",
    },
    {
      name: "circleRadius",
      default: 5,
      max: 20,
      min: 2,
      step: 1,
      type: "numeric",
    },
  ],
};
