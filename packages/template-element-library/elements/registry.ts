import type {
  ComponentDimensions,
  ElementAsset,
  ElementDependency,
  ElementInitialProps,
  ElementInstallationMode,
} from "@remotion/studio-protocol";
import type { ComponentType } from "react";
import { AnimatedTitle } from "./animated-title/animated-title";
import { LowerThird } from "./lower-third/lower-third";
import { AnimatedBackground } from "./animated-background/animated-background";

export type ElementDefinition = {
  slug: string;
  displayName: string;
  category: string;
  description: string;
  usage: string;
  component: ComponentType<Record<string, unknown>>;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  posterFrame: number;
  previewBackground: string;
  dimensions: ComponentDimensions | null;
  installationMode: ElementInstallationMode;
  initialProps: ElementInitialProps | null;
  installationProps: ElementInitialProps | null;
  dependencies: readonly ElementDependency[];
  assets: readonly ElementAsset[];
};

// Keep each source at elements/<slug>/<slug>.tsx; the website loads that same
// file as raw text. Register authoring previews separately in remotion/Root.tsx.
export const elements: readonly ElementDefinition[] = [
  {
    slug: "animated-title",
    displayName: "Animated title",
    category: "Text",
    description: "A centered title with a soft entrance and exit.",
    usage:
      "Edit the text, typography, and animation directly in Studio. The title stays centered within its bounds.",
    component: AnimatedTitle,
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 150,
    posterFrame: 45,
    previewBackground: "#eee9f7",
    dimensions: { width: 760, height: 180 },
    installationMode: "wrapped",
    initialProps: null,
    installationProps: null,
    dependencies: [],
    assets: [],
  },
  {
    slug: "lower-third",
    displayName: "Lower third",
    category: "Overlays",
    description: "An animated name and role label for your footage.",
    usage:
      "Edit the name, role, and bar colors in Studio. Position the group over your footage; the preview background is not installed.",
    component: LowerThird,
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 150,
    posterFrame: 45,
    previewBackground: "#dcebe3",
    dimensions: { width: 560, height: 150 },
    installationMode: "wrapped",
    initialProps: null,
    installationProps: null,
    dependencies: [],
    assets: [],
  },
  {
    slug: "animated-background",
    displayName: "Moving grid",
    category: "Backgrounds",
    description: "A looping grid with adjustable background and line colors.",
    usage:
      "Place behind other layers. Change the grid and background colors in the Inspector. It fills its parent and loops over its duration.",
    component: AnimatedBackground,
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 150,
    posterFrame: 45,
    previewBackground: "#fff2dd",
    dimensions: null,
    installationMode: "component-owned-sequence",
    initialProps: { color: "#e3a253", backgroundColor: "#fff2dd" },
    installationProps: null,
    dependencies: [],
    assets: [],
  },
];
