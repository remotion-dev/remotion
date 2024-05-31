---
image: /generated/articles-docs-transitions-presentations-fade.png
crumb: "@remotion/transitions - Presentations"
title: "fade()"
---

A simple fade animation. The incoming slide fades in over the outgoing slide, while the outgoing slide does not change. Works only if the incoming slide is fully opaque.

<Demo type="fade" />

## Example

```tsx twoslash title="FadeTransition.tsx"
import { AbsoluteFill } from "remotion";

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({ children, color }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: "center",
        alignItems: "center",
        fontSize: 200,
        color: "white",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## API

An object which takes:

### `enterStyle?`<AvailableFrom v="4.0.84"/>

The style of the container element when the scene is is entering.

### `exitStyle?`<AvailableFrom v="4.0.84"/>

The style of the container element when the scene is exiting.

### `shouldFadeOutExitingScene?`<AvailableFrom v="4.0.166"/>

Whether the exiting scene should fade out or not. Default `false`.

:::note
The default is `false` because if both the entering and existing scene are semi-opaque, the whole scene will be semi-opaque, which will make the content underneath shine though.  
We recommend for transitioning between fully opaque scenes setting this to `false`.  
If the scenes are not fully covered (like fading between overlays), we recommend setting this to `false`.
:::

## See also

- [Source code for this presentation](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/presentations/fade.tsx)
- [Presentations](/docs/transitions/presentations)
