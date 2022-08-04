---
id: lottie-lottiefiles
sidebar_label: "Find Lottie files"
title: "Finding Lottie files to use"
slug: lottiefiles
---

import {InlineStep} from '../../components/InlineStep';

[LottieFiles](https://lottiefiles.com) is a website where people can share and download Lottie files.

<img src="/img/lottie/lottiefiles.png" />

<br/>
<br/>

If you find a file that you like, click on it, then click `Download` <InlineStep>1</InlineStep> and choose `Lottie JSON` <InlineStep>2</InlineStep> as the format.
<img src="/img/lottie/lottiefiles-instructions.png" />

### Import the file into Remotion

Copy the file into the Remotion project. The recommended way is to the the JSON inside the `public/` folder of Remotion (create it if necessary) and then load it using [`staticFile()`](/docs/staticfile):

```tsx twoslash title="Animation.tsx"
import { continueRender, delayRender, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

const Balloons = () => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));

  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile("animation.json"))
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        console.log("Animation failed to load", err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## See also

- [Importing from After Effects](/docs/lottie/after-effects)
