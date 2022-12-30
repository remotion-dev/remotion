---
id: clipper
title: <Experimental.Clipper>
crumb: "Experimental API"
---

<ExperimentalBadge>
This package is currently a proof of technology.

The API may change in any version. Monitor this documentation page to see breaking changes when upgrading.
</ExperimentalBadge>

This is a special component that will cause Remotion to only partially capture the frame of the video. The remaining area will stay black (if the render image format is `jpeg`) or transparent (if the render image format is `png`).

## Example

Only the left half of the component will be rendered:

```tsx twoslash title="EmptyFrame.tsx"
import { AbsoluteFill, Experimental, useVideoConfig } from "remotion";

export const MyComp: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Experimental.Clipper x={0} y={0} width={width / 2} height={height} />
      <AbsoluteFill style={{ backgroundColor: "red" }}></AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## API

The properties `x`, `y`, `width` and `height` define a rect in pixels that should be captured. All props are mandatory and require an integer.

## Rules

<p>
<Step>1</Step> Even elements <strong>outside</strong> of the <code>{"<Clipper>"}</code> component will be clipped.
</p>

<p>
<Step>2</Step> If the <code>imageFormat</code> is <code>jpeg</code>, the remaining frame will become black, if the <code>imageFormat</code> is <code>png</code>, the remaining frame will become transparent. 
</p>
<p>
<Step>3</Step> Only one <a href="/docs/null"><code>{"<Experimental.Null>"}</code></a> or <code>{"<Experimental.Clipper>"}</code> component can be rendered per frame.  
 Rendering multiple is an error.
</p>

## See also

- [`<Experimental.Null>`](/docs/null)
