---
title: <Img />
id: img
---

The `<Img />` can be used like a regular `<img>` HTML tag.
The difference is that if you use the component from Remotion, that Remotion will ensure that the image is loaded before rendering the frame. That way you can avoid flickers if it happens that the image is still loading during rendering.

## Example

```tsx twoslash
import { Img } from "remotion";
import hi from "./hi.png";

export const MyComp: React.FC = () => {
  return <Img src={hi} />;
};
```

## Restrictions

- The maximum resolution that Chrome can display is `2^29` pixels (539 megapixels). Remotion inherits this restriction.

## See also

- [Use `<Img>` and `<IFrame>` tags](/docs/use-img-and-iframe)
