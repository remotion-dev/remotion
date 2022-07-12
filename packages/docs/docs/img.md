---
title: <Img>
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

## GIFs

Don't use the `<Img>` tag for GIFs, use [`@remotion/gif`](/docs/gif) instead.

## Restrictions

- The maximum resolution that Chrome can display is `2^29` pixels (539 megapixels) <sup><a href="https://stackoverflow.com/questions/57223559/what-is-the-maximum-image-dimensions-supported-in-desktop-chrome#:~:text=than%202%5E29-,(539MP)">[source]</a></sup>. Remotion inherits this restriction.

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/Img.tsx)
- [Use `<Img>` and `<IFrame>` tags](/docs/use-img-and-iframe)
