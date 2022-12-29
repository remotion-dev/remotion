---
id: "null"
title: <Experimental.Null>
crumb: "Experimental API"
---

<ExperimentalBadge>
This component is currently a proof of technology.

The API may change in any version. Monitor this documentation page to see breaking changes when upgrading.
</ExperimentalBadge>

This is a special component, that, when rendered, will skip rendering the frame altogether.  
You can render it when you are sure that the frame is empty and save rendering time.

```tsx twoslash title="EmptyFrame.tsx"
import { AbsoluteFill, Experimental } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <Experimental.Null />
      <div>This will not be rendered</div>
    </AbsoluteFill>
  );
};
```

## Rules

<p>
<Step>1</Step> If this component is rendered, nothing visual in the frame will be rendered.
</p>
<p>
<Step>2</Step> Even elements <strong>outside</strong> of the <code>{"<Null>"}</code> component will disappear.
</p>
<p>
<Step>3</Step> Audio will still be rendered.
</p>
<p>
<Step>4</Step> If the <code>imageFormat</code> is <code>jpeg</code>, a black frame will be generated, if the <code>imageFormat</code> is <code>png</code>, a transparent frame will be generated. 
</p>
<p>
<Step>5</Step> If this component is rendered, an <a href="/docs/clipper"><code>{"<Experimental.Clipper>"}</code></a> may not be rendered at the same time.
</p>

## See also

- [`<Experimental.Clipper>`](/docs/clipper)
