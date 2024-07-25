---
image: /generated/articles-docs-use-buffer-state.png
title: useBufferState()
id: use-buffer-state
crumb: "API"
---

_available from 4.0.111_

You can use this hook inside your [composition](/docs/terminology/composition) to retrieve functions that can inform the Player that your component is currently loading data.

```tsx twoslash title="MyComp.tsx"
import React from "react";
import { useBufferState } from "remotion";

const MyComp: React.FC = () => {
  const buffer = useBufferState();

  React.useEffect(() => {
    const delayHandle = buffer.delayPlayback();

    setTimeout(() => {
      delayHandle.unblock();
    }, 5000);

    return () => {
      delayHandle.unblock();
    };
  }, []);

  return <></>;
};
```

## API

Returns an object with one method:

### `delayPlayback()`

Tells the Player to delay playback until you call `unblock()`.

## Usage notes

### Handle unmounting

The user might seek to a different portion of the video which is immediately available.  
Use the cleanup function of <code>useEffect()</code> to clear the handle when your component is unmounted.

```tsx twoslash title="❌ Causes problems with React strict mode"
import React, { useState } from "react";
import { useBufferState } from "remotion";

const MyComp: React.FC = () => {
  const buffer = useBufferState();
  const [delayHandle] = useState(() => buffer.delayPlayback()); // 💥

  React.useEffect(() => {
    setTimeout(() => {
      delayHandle.unblock();
    }, 5000);
  }, []);

  return <></>;
};
```

### Avoid calling inside `useState()`

While the following implementation works in production, it fails in development if you are inside React Strict mode, because the `useState()` hook is called twice, which causes the first invocation of the buffer to never be cleared and the video to buffer forever.

```tsx twoslash title="❌ Doesn't clear the buffer handle when seeking to a different portion of a video"
import React, { useState } from "react";
import { useBufferState } from "remotion";

const MyComp: React.FC = () => {
  const buffer = useBufferState();
  const [delayHandle] = useState(() => buffer.delayPlayback()); // 💥

  React.useEffect(() => {
    setTimeout(() => {
      delayHandle.unblock();
    }, 5000);

    return () => {
      delayHandle.unblock();
    };
  }, []);

  return <></>;
};
```

### Together with `delayRender()`

[`delayRender()`](/docs/delay-render) is a different API that comes into play during rendering.

If you are loading data, you might want to both delay the screenshotting of your component during rendering and start a buffering state during Preview, in which case you need to use both APIs together.

```tsx twoslash title="Using delayRender() and delayPlayback() together"
import React from "react";
import { useBufferState, delayRender, continueRender } from "remotion";

const MyComp: React.FC = () => {
  const buffer = useBufferState();
  const [handle] = React.useState(() => delayRender());

  React.useEffect(() => {
    const delayHandle = buffer.delayPlayback();

    setTimeout(() => {
      delayHandle.unblock();
      continueRender(handle);
    }, 5000);

    return () => {
      delayHandle.unblock();
    };
  }, []);

  return <></>;
};
```

## See also

- [Buffer state](/docs/player/buffer-state)
