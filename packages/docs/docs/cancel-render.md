---
id: cancel-render
title: cancelRender()
sidebar_label: cancelRender()
crumb: "How to"
---

By invoking `cancelRender()`, Remotion will stop rendering all the frames, and

`cancelRender()` throws a simple error &mdash; `"Rendering Cancelled"` &mdash; for now, and it prevents any video from being rendered.

## Example

The `cancelRender()` function can be triggered in any way. But in this example, a button element is used to call the API.

```tsx twoslash
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
} from "remotion";

export const BaseRender: React.FC = () => {
  const [handle] = useState(() => delayRender("Fetching audio data..."));

  useEffect(() => {
    fetch("https://example.com")
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, []);

  return (
    <AbsoluteFill
      style={{
        fontFamily: "ubuntu",
        fontSize: "500",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    ></AbsoluteFill>
  );
};
```
