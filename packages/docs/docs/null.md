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
<Step>1</Step> If this component is rendered, no screenshot will be taken during rendering
</p>
<p>
<Step>2</Step> In the preview, the content will be rendered with zero opacity.
</p>
<p>
<Step>3</Step> Even elements <strong>outside</strong> of the <code>{"<Null>"}</code> component will disappear.
</p>
<p>
<Step>4</Step> Audio will still be rendered.
</p>
<p>
<Step>5</Step> Effects will still be executed.
</p>

<p>
<Step>6</Step> If the <code>imageFormat</code> is <code>jpeg</code>, a black frame will be generated, if the <code>imageFormat</code> is <code>png</code>, a transparent frame will be generated. 
</p>
<p>
<Step>7</Step> Only one <code>{"<Experimental.Null>"}</code> or <a href="/docs/clipper"><code>{"<Experimental.Clipper>"}</code></a> component can be rendered per frame.  
 Rendering multiple is an error.
</p>

## See also

- [`<Experimental.Clipper>`](/docs/clipper)
