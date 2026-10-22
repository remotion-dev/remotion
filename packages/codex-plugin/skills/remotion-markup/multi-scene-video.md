If the video being created is a multi-scene video, it should be structured in a special way.
Create a new folder and put each scene in a separate file.

```tsx
// SceneA.tsx
export const SceneA: React.FC = () => {
 return // ...
}
```

```tsx
// SceneB.tsx
export const SceneB: React.FC = () => {
  return // ...
} 
```

Install `@remotion/transitions` if not yet available:

```
npx remotion add @remotion/transitions
```

// MyVideo.tsx
```tsx
import {TransitionSeries} from '@remotion/transitions';

const MyVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={4 * fps} name="SceneA">
        <SceneA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={4 * fps} name="SceneB">
        <SceneB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  )
}
```

It could also make sense to register each scene individually in the root file so it can be edited there.
If a composition with the same component is registered, one can double click the sequence in the main composition and jump to that composition.

```tsx
export const Root: React.FC = () => {
  return (
    <>
      <Folder id="MyVideo-Scenes">
        <Composition
          id="Scene1"
          component={Scene1}
          durationInFrames={5 * fps}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene2"
          component={Scene2}
          durationInFrames={5 * fps}
          fps={30}
          width={1920}
          height={1080}
        /> 
      </Folder>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={10 * fps}
        fps={30}
        width={1920}
        height={1080}
      /> 
    </>
  )
}
```

This allows the user to trim the start and end of the durations visually and add [transitions](./transitions.md) later.
Prefer inlining the `durationInFrames` values, because only then they are editable. It's okay if the value is redundant.
