---
image: /generated/articles-docs-watch-static-file.png
id: watchstaticfile
title: watchStaticFile()
crumb: "API"
---

_Available from v4.0.60._

Watches for changes in a specific static file and invokes a callback function when the file changes, enabling dynamic updates in your Remotion projects.

:::warning
This feature is only available within the Remotion Studio environment.
:::

## Function Signature

```ts twoslash
import { watchStaticFile } from "remotion";
import type {StaticFile} from './get-static-files';

type WatcherCallback = (newData: StaticFile | null) => void;

const cancel = watchStaticFile(
  filename: string,
  callback: WatcherCallback
): () => void;

//cancel()
```

## Arguments

Takes two arguments and returns a function that can be used to `cancel` the event listener.

### `filename`

A name of the file in `/public` folder to watch for changes.

### `callback`

A callback function that will be called when the file is modified.

### Example

```tsx twoslash title="example.tsx"
import { StaticFile, watchStaticFile } from "remotion";

// Watch for changes in a specific static file
const cancelWatcher = watchStaticFile(
  "your-static-file.jpg",
  (newData: StaticFile | null) => {
    if (newData) {
      console.log(`File ${newData.name} has been added or modified.`);
    } else {
      console.log("File has been deleted.");
    }
  },
);

// To stop watching for changes, call the cancel function
// cancelWatcher();
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/watch-static-file.ts)
