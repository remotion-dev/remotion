---
image: /generated/articles-docs-lottie-lottie-staticfile.png
id: lottie-staticfile
sidebar_label: "Loading from staticFile()"
title: "Loading Lottie animations from staticFile()"
slug: staticfile
crumb: "@remotion/lottie"
---

In order to load a Lottie animation from a file that has been put into the `public/` folder, use [`staticFile()`](/docs/staticfile) in combination with [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and Remotion's [`delayRender()`](/docs/delay-render) function.

Use the `LottieAnimationData` type to keep a state using React's `useState()` and only render the [`<Lottie>`](/docs/lottie/lottie) component once the data has been fetched.

```tsx twoslash title="Animation.tsx"
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

const Square = () => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));

  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile("data.json"))
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## See also

- [`<Lottie>`](/docs/lottie/lottie)
- [Loading from a URL](/docs/lottie/remote)
