import type {
  ComponentDimensions,
  ElementAsset,
  ElementDependency,
  ElementInitialProps,
  ElementInstallationMode,
} from "@remotion/studio-protocol";

export type ElementDefinition = {
  slug: string;
  displayName: string;
  category: string;
  description: string;
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

export const elements: readonly ElementDefinition[] = [
  {
    slug: "animated-title",
    displayName: "Animated title",
    category: "Text",
    description: "A centered title with a soft entrance and exit.",
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
  {
    slug: "accent-captions",
    displayName: "Accent captions",
    category: "Captions",
    description:
      "Word-by-word captions with a warm highlight and a crisp outline.",
    width: 900,
    height: 300,
    fps: 30,
    durationInFrames: 150,
    posterFrame: 45,
    previewBackground: "transparent",
    dimensions: { width: 900, height: 160 },
    installationMode: "component-owned-sequence",
    initialProps: {
      captions: [
        {
          text: "Make",
          startMs: 0,
          endMs: 600,
          timestampMs: 300,
          confidence: null,
        },
        {
          text: " every",
          startMs: 600,
          endMs: 1300,
          timestampMs: 950,
          confidence: null,
        },
        {
          text: " word",
          startMs: 1300,
          endMs: 2100,
          timestampMs: 1700,
          confidence: null,
        },
        {
          text: " count.",
          startMs: 2100,
          endMs: 3000,
          timestampMs: 2550,
          confidence: null,
          pageBreakAfter: true,
        },
        {
          text: "Keep",
          startMs: 3000,
          endMs: 3600,
          timestampMs: 3300,
          confidence: null,
        },
        {
          text: " it",
          startMs: 3600,
          endMs: 4000,
          timestampMs: 3800,
          confidence: null,
        },
        {
          text: " moving.",
          startMs: 4000,
          endMs: 5000,
          timestampMs: 4500,
          confidence: null,
        },
      ],
      width: 900,
      combineTokensWithinMilliseconds: 3000,
      highlightColor: "#ffb27d",
    },
    installationProps: null,
    dependencies: [{ name: "@remotion/captions", version: null }],
    assets: [],
  },
];
