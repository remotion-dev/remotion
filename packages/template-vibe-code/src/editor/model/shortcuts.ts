export type ShortcutGroup = {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
};

// Mirrors the Remotion Studio keyboard shortcuts where the editor supports
// the same feature.
export const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Playback",
    shortcuts: [
      { keys: ["Space"], description: "Play / pause" },
      { keys: ["K"], description: "Pause" },
      { keys: ["L"], description: "Play, press again to speed up" },
      { keys: ["←", "→"], description: "Previous / next frame" },
      { keys: ["⇧ ←", "⇧ →"], description: "Jump 1 second" },
      { keys: ["A", "Home"], description: "Jump to start" },
      { keys: ["E", "End"], description: "Jump to end" },
      { keys: ["↵"], description: "Pause and return to start" },
      { keys: ["G"], description: "Go to frame" },
      { keys: ["⇧ L"], description: "Toggle loop" },
      { keys: ["M"], description: "Mute / unmute" },
    ],
  },
  {
    title: "Timeline",
    shortcuts: [
      { keys: ["I"], description: "Set in point" },
      { keys: ["O"], description: "Set out point" },
      { keys: ["X"], description: "Clear in / out" },
      { keys: ["⌘ A"], description: "Select all layers" },
      { keys: ["Esc"], description: "Clear selection" },
      { keys: ["⌫"], description: "Delete selected layers" },
      { keys: ["⌘ D"], description: "Duplicate selected layers" },
      { keys: ["⌘ ⇧ D"], description: "Split selected layers at playhead" },
      { keys: ["⌥ ↑", "⌥ ↓"], description: "Move layer up / down" },
    ],
  },
  {
    title: "Canvas",
    shortcuts: [
      { keys: ["+", "−"], description: "Zoom in / out" },
      { keys: ["0"], description: "Fit to screen" },
      { keys: ["⇧ O"], description: "Toggle outlines (select vs. interact)" },
      { keys: ["T"], description: "Toggle checkerboard" },
      { keys: ["F"], description: "Fullscreen" },
    ],
  },
  {
    title: "Project",
    shortcuts: [
      { keys: ["⌘ S"], description: "Save to disk" },
      { keys: ["⌘ Z"], description: "Undo" },
      { keys: ["⌘ ⇧ Z"], description: "Redo" },
      { keys: ["R"], description: "Render" },
      { keys: ["PgUp", "PgDn"], description: "Previous / next composition" },
    ],
  },
  {
    title: "Panels",
    shortcuts: [
      { keys: ["⌘ B"], description: "Toggle sidebar" },
      { keys: ["⌘ J"], description: "Toggle inspector" },
      { keys: ["⌘ E"], description: "Toggle code editor" },
      { keys: ["⌘ ."], description: "Toggle timeline" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];
