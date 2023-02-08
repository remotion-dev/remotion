---
image: /generated/articles/docs-cancel-render.png
id: cancel-render
title: cancelRender()
sidebar_label: cancelRender()
crumb: "How to"
---

When you invoke the `cancelRender()` function, you're telling remotion to stop rendering all the frames.

`cancelRender()` throws a simple error &mdash; `"Rendering Cancelled"` &mdash; for now, and it prevents any video from being rendered.

## Example

The `cancelRender()` function can be triggered in any way. But in this example, a button element is used to call the API.

```tsx twoSlash {2, 30}
import React from "react";
import { AbsoluteFill, cancelRender, useCurrentFrame } from "remotion";

export const BaseRender: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        fontFamily: "ubuntu",
        fontSize: "500",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <h1>The current frame is {frame}</h1>
      <button
        type="button"
        style={{
          color: "#fff",
          height: "50px",
          width: "35%",
          fontSize: "22px",
          textAlign: "center",
          borderRadius: "4px",
          backgroundColor: "#0b84f3",
          border: "none",
        }}
        onClick={cancelRender}
      >
        Click me to cancel this render
      </button>
    </AbsoluteFill>
  );
};
```

When you click the button, you'd get an error similar to the one in the image below

![cancel-render error](/img/cancel-render/error.png)
