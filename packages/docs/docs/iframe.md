---
title: <IFrame>
id: iframe
---

The `<IFrame />` can be used like a regular `<iframe>` HTML tag.
The difference is that if you use the component from Remotion, that Remotion will ensure that the iframe is loaded before rendering the frame. That way you can avoid flickers if it happens that the iframe is still loading during rendering.

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
