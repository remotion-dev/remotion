---
image: /generated/articles-docs-artifact.png
title: '<Artifact>'
crumb: API
---

# `<Artifact>`<AvailableFrom v="4.0.176"/>

By rendering an `<Artifact>` tag in your Remotion markup, [an extra file will get emitted during rendering](/docs/artifacts).

```tsx twoslash title="MyComp.tsx"
import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return frame === 0 ? <Artifact filename="my-file.txt" content="Hello World!" /> : null;
};
```

If rendered on the CLI or via the Studio, this will emit an additional file:

```
$ npx remotion render MyComp
+ out/MyComp.mp4
+ my-file.txt (12B)
```

It is allowed for a composition to emit multiple files.  
However, the file names must be unique.

The component will get evaluated on every frame, which means if you want to emit just one file, only render it on one frame.

```tsx twoslash title="❌ Will generate an asset on every frame and throw an error because the file name is not unique"
import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return frame === 0 ? <Artifact filename="my-file.txt" content="Hello World!" /> : null;
};
```

## API

### `filename`

A string that is the name of the file that will be emitted.  
Use forward slashes only, even on Windows.  
Must match the regex `/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g`.

### `content`

A `string` or `Uint8Array` that is the content of the file that will be emitted. Don't consider an `Uint8Array` to be faster, because it needs to be serialized.

### `downloadBehavior?`<AvailableFrom v="4.0.296" />

Only applies to serverless rendering.

How the output file should behave when accessed through the output link in the browser.  
Either:

- `{"type": "play-in-browser"}` - the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` - a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

The default behavior is the same download behavior you defined for the main rendering output.

## `Artifact.Thumbnail`<AvailableFrom v="4.0.290" />

A special symbol that if you pass it to the [`content`](/docs/artifact#content) prop, it will [emit the image data of the current frame as an artifact](/docs/artifacts#emitting-thumbnails).

```tsx twoslash title="Emitting the first frame as a thumbnail"
import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{frame === 0 ? <Artifact content={Artifact.Thumbnail} filename="thumbnail.jpeg" /> : null}</>;
};
```

See the [Emitting Thumbnails](/docs/artifacts#emitting-thumbnails) page for more important information.

## Compatibility

<CompatibilityTable chrome firefox safari nodejs="" bun="" serverlessFunctions="" clientSideRendering serverSideRendering player="No-op" studio="No-op" hideServers />

## See also

- [Emitting Artifacts](/docs/artifacts)
- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/Artifact.tsx)
