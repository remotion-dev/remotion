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

For custom authoring UIs, `createCanvasHoverController()`,
`measureCanvasOutlineTargets()`, `useCanvasOutlineMeasurements()`, and
`orderCanvasOutlinesForRendering()` are independent primitives also consumed by
Studio. Measurements include transformed HTML/SVG bounds and cropping, in
unscaled overlay pixels. The overlay must share the elements' document and
must not have a CSS transform or SVG viewBox scaling. The measurement hook
observes element sizes; invoke its `updateOutlinesRef` after position, transform,
frame, or viewport changes. Keep frame subscriptions in the active overlay and
omit inactive targets to avoid unnecessary layout reads.

Source writes and transform editing handles remain the host's responsibility.
