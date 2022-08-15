---
title: "Embedding a <Player> into an <iframe>"
---

This snippet is useful if you want to isolate the global styles of your homepage from the global styles of the [`<Player>`](/docs/player), for example if you are using TailwindCSS.

Don't forget to give your `<Player>` a `className` of `__player` if you use this snippet.

```tsx title="IframePlayerWrapper.tsx"
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const className = "__player";
const borderNone: React.CSSProperties = {
  border: "none",
};

export const IframePlayerWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const mountNode = contentRef?.contentDocument?.body;

  useEffect(() => {
    if (!contentRef || !contentRef.contentDocument) return;

    // Remove margin and padding so player fits snugly
    contentRef.contentDocument.body.style.margin = "0";
    contentRef.contentDocument.body.style.padding = "0";

    // When player div is resized also resize iframe
    resizeObserverRef.current = new ResizeObserver(([playerEntry]) => {
      const playerRect = playerEntry.contentRect;
      contentRef.width = String(playerRect.width);
      contentRef.height = String(playerRect.height);
    });

    // The remotion player element
    const playerElement = contentRef.contentDocument.querySelector(
      "." + className
    );

    if (!playerElement) {
      throw new Error(
        'Player element not found. Add a "' +
          className +
          '" class to the <Player>.'
      );
    }

    // Watch the player element for size changes
    resizeObserverRef.current.observe(playerElement as Element);

    return () => {
      // ContentRef changed: unobserve!
      (resizeObserverRef.current as ResizeObserver).unobserve(
        playerElement as Element
      );
    };
  }, [contentRef]);

  return (
    // eslint-disable-next-line @remotion/warn-native-media-tag
    <iframe ref={setContentRef} style={borderNone}>
      {mountNode && ReactDOM.createPortal(children, mountNode)}
    </iframe>
  );
};
```

```tsx title="Implementation"
return (
  <IframePlayerWrapper>
    <Player className="__player" {/* ... */} />
  </IframePlayerWrapper>
)
```

## See also

- [`<Player>` examples](/docs/player/examples)
