---
name: compositions
description: Defining compositions, stills, folders, default props and dynamic metadata
metadata:
  tags: composition, still, folder, props, metadata
---

A `<Composition>` defines the component, width, height, fps and duration of a renderable video.

## Default Props and scaffold metadata

Pass `defaultProps` to provide initial values for your component.  
Values must be JSON-serializable (`Date`, `Map`, `Set`, and `staticFile()` are supported).
Use `defaultProps` for composition-wide values that should be visible and editable before the video renders.

For Studio editing, keep `defaultProps` as an inline object literal on `<Composition>` or `<Still>`.
Do not store it in a variable, import it, spread it, create it with a helper, or wrap it in `satisfies`.
When scaffolding, keep the component and `<Composition>` registration in the same file so `width`, `height`, `fps`, `durationInFrames`, and `defaultProps` are visible next to the code that uses them.
Use `type` declarations for props rather than `interface` to ensure `defaultProps` type safety.

```tsx
type Props = {
  readonly title: string;
};

export const MyComposition = ({ title }: Props) => <h1>{title}</h1>;

const defaultProps = { title: "Hello World" };

// 👍 Inline metadata and defaults
<Composition
  id="MyComposition"
  component={MyComposition}
  durationInFrames={100}
  fps={30}
  width={1080}
  height={1080}
  defaultProps={{ title: "Hello World" }}
/>;

// 👎 Hidden defaults cannot be saved back by Studio
<Composition
  id="OtherComposition"
  component={MyComposition}
  durationInFrames={100}
  fps={30}
  width={1080}
  height={1080}
  defaultProps={defaultProps}
/>;
```

## Folders

Use `<Folder>` to organize compositions in the sidebar.  
Folder names can only contain letters, numbers, and hyphens.

```tsx
import { Composition, Folder } from "remotion";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition id="Promo" /* ... */ />
        <Composition id="Ad" /* ... */ />
      </Folder>
      <Folder name="Social">
        <Folder name="Instagram">
          <Composition id="Story" /* ... */ />
          <Composition id="Reel" /* ... */ />
        </Folder>
      </Folder>
    </>
  );
};
```

## Stills

Use `<Still>` for single-frame images. It does not require `durationInFrames` or `fps`.

```tsx
import { Still } from "remotion";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot = () => {
  return (
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  );
};
```

## Calculate Metadata

Use `calculateMetadata` to make dimensions, duration, or props dynamic based on input props, fetched data, or asset metadata.
For static dimensions, duration, FPS, and initial props, inline the values on `<Composition>`.

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
  abortSignal,
}) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
  };
};

<Composition
  id="MyComposition"
  component={MyComposition}
  fps={30}
  width={1080}
  height={1080}
  defaultProps={{ videoId: "abc123" }}
  calculateMetadata={calculateMetadata}
/>;
```

The function can return `props`, `durationInFrames`, `width`, `height`, `fps`, and codec-related defaults. It runs once before rendering begins.

## Nesting compositions within another

To add a composition within another composition, you can use the `<Sequence>` component with a `width` and `height` prop to specify the size of the composition.

```tsx
<AbsoluteFill>
  <Sequence width={COMPOSITION_WIDTH} height={COMPOSITION_HEIGHT}>
    <CompositionComponent />
  </Sequence>
</AbsoluteFill>
```
