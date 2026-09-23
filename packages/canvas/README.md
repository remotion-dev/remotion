# @remotion/canvas

Headless primitives for Remotion authoring interfaces

## Usage

`Canvas` accepts the Player props plus a controller. Outlines are opt-in:

```tsx
const controller = useCanvasController();

<Canvas
	controller={controller}
	showOutlines
	component={Video}
	compositionWidth={1920}
	compositionHeight={1080}
	durationInFrames={150}
	fps={30}
/>;
```

In outline mode, the composition handles hover and click selection. Shift-click
selects a range, Cmd/Ctrl-click toggles an item, and clicking empty space or
pressing Escape on the canvas clears selection. Player controls remain usable.
Set `showOutlines={false}` to interact with the composition's own controls.

Subscribe to `controller.timeline` for registered layers and use
`useCanvasSelection(controller.selection)` for selection. Use
`getCanvasSequenceNodePathInfo(track)` to construct each layer's selection item
and `useCanvasSequenceHover(controller.hover, nodePathInfo, 'timeline')` for
bidirectional hover highlighting. The hook returns `hovered`, `onPointerEnter`,
and `onPointerLeave`; each layer subscribes only to its own hover state.

If the host resolves source identities, pass `resolveSequenceNodePathInfo` to
`Canvas` and use the same resolver in the layer list. Return `null` for layers
that should not be selectable. The default uses an existing source identity or
falls back to the mounted sequence ID; that fallback is not a persistent source
reference across remounts. Outlines require a registered DOM ref, so a
`Sequence` with `layout="none"` has no outline of its own.

For custom authoring UIs, Studio and Canvas consume the same outline APIs:

- `getCanvasSelectableOutlines()` discovers registered outline targets;
  `getCanvasVisibleOutlineTargets()` filters them by frame.
- `getCanvasOutlineActivity()` gates active measurement, and
  `getCanvasActiveOutlineTargets()` keeps selected or hovered source groups
  active when the pointer leaves the canvas.
- `getCanvasOutlineLayoutTargets()` distinguishes direct sequence selection
  from selected properties, highlights matching source instances, and resolves
  clicks to the first visible instance of a source node.
- `useCanvasOutlines()` measures targets, clears stale canvas hover, and returns
  `outlinesForRendering`, `outlinesByKey`, `targetsByKey`, and
  `hoveredNodePathKey`. Set `freezeOrder` during a captured drag to keep SVG
  nodes in place. Supply `crop` alongside the layout target fields.
- `CanvasOutlinePolygon` renders the SVG polygon with shared geometry and hover
  behavior. Render it inside your overlay's `<svg>`, pass visibility, selection,
  colors, and `onHoverChange`, and compose editing handlers through normal SVG
  props. It forwards its ref for pointer capture and hit testing.
- `handleCanvasOutlinePointerDown()` consumes a primary pointer event and
  returns a selection decision, preserving an existing multiselection on plain
  clicks. Dragging hosts honor `deferSelection` until release; selection-only
  hosts apply `shouldUpdateSelection` immediately. Studio adds its drag and
  source-editing behavior around this decision.

Lower-level `createCanvasHoverController()`, `measureCanvasOutlineTargets()`,
`useCanvasOutlineMeasurements()`, and `orderCanvasOutlinesForRendering()` remain
available independently. Measurements include transformed HTML/SVG bounds and cropping, in
unscaled overlay pixels. The overlay must share the elements' document and
must not have a CSS transform or SVG viewBox scaling. The measurement hook
observes element sizes; invoke its `updateOutlinesRef` after position, transform,
frame, or viewport changes. Keep frame subscriptions in the active overlay and
omit inactive targets to avoid unnecessary layout reads. `useCanvasOutlines()`
also accepts this ref and does not subscribe to playback itself.

Source writes and transform editing handles remain the host's responsibility.
