---
image: /generated/articles-docs-iframe.png
title: <IFrame>
id: iframe
crumb: "API"
---

The `<IFrame />` can be used like the regular `<iframe>` HTML tag.

Remotion automatically wraps the `<iframe>` in a [`delayRender()`](/docs/delay-render) call
and ensures that the iframe is loaded before rendering the frame.

Ideally, the website should not have any animations, since only animations using [`useCurrentFrame()`](/docs/use-current-frame) are supported by Remotion. See [Flickering](/docs/flickering) for an explanation.

## Example

```tsx twoslash
import { IFrame } from "remotion";

export const MyComp: React.FC = () => {
  return <IFrame src="https://remotion.dev" />;
};
```

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/IFrame.tsx)
- [Use `<Img>` and `<IFrame>` tags](/docs/use-img-and-iframe)
