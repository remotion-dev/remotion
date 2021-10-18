---
title: <Img />
id: img
---

The `<Img />` can be used like a regular `<img>` HTML tag.
The difference is that if you use the component from Remotion, that Remotion will ensure that the image is loaded before rendering the frame. That way you can avoid flickers if it happens that the image is still loading during rendering.

## Example

```tsx
import { Img } from "remotion";
import hi from "./hi.png";

export const MyComp: React.FC = () => {
  return <Img src={hi} />;
};
```

## See also

- [Use `<Img>` and `<IFrame>` tags](/docs/use-img-and-iframe)
