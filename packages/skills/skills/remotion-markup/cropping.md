# Cropping

The following components support the `cropLeft`, `cropRight`, `cropTop`, and
`cropBottom` props:

- `<Sequence>` from `remotion`, when `layout="absolute-fill"`
- `<CanvasImage>` from `remotion`
- `<Img>` from `remotion`
- `<AnimatedImage>` from `remotion`
- `<HtmlInCanvas>` from `remotion`
- `<Solid>` from `remotion`
- `<Video>` from `@remotion/media`
- `<Gif>` from `@remotion/gif`
- `<RemotionRiveCanvas>` from `@remotion/rive`

Crop values are ratios between `0` and `1`. A value of `0` applies no crop on
that edge. Keep crop props directly on the component and keep animations inline
so Remotion Studio can expose and edit its crop controls:

```tsx
<CanvasImage
  src={staticFile("photo.png")}
  cropLeft={interpolate(frame, [0, 30], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}
  cropBottom={0.1}
/>
```

Do not use `clipPath` when one of these crop props is sufficient. The crop props
remain editable in Studio and work with its on-canvas crop handles.

`Interactive.*` HTML and SVG elements do not support cropping by default. To
make a custom component croppable, include `Interactive.cropSchema` in its
interactivity schema, accept `InteractiveCropProps`, and apply or forward all
four crop props to the rendered element or an absolute-fill `<Sequence>`.
