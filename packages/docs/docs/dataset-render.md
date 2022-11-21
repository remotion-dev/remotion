---
id: dataset-render
title: Render a dataset
---

You can write a script to generate videos based on different input props from datasets.
Remotion's rendering engine is built on Node.js which allows us to script

## Setup a project

For demonstration purposes, the video from [@remotion/player](https://www.remotion.dev/docs/player) is taken as example. It takes two inputs, a person's name and the hex value of their favorite colour and then uses remotion to make a video showing this information. The code of the example can be found [here](https://github.com/remotion-dev/remotion/tree/0991f68e28d9fd48ca7b2ad45871649bf35e3018/packages/docs/components/ColorDemo).

Assuming you have already installed a basic Remotion template (this can be done using `npm init video`), you can proceed to write the JavaScript or TypeScript script.

## Writing the script

In order to render our videos, we'll first need to bundle our project using Webpack and prepare it for rendering.

This can be done by using the [bundle()](https://www.remotion.dev/docs/bundle) function from the `@remotion/bundler` package.
Next we'll use getCompositions to extract all the defined compositions.

```
import path from "path";
import { bundle } from "@remotion/bundler";

const entry = "./src/index";
  console.log("Creating a Webpack bundle of the video");
  const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
    // If you have a Webpack override, make sure to add it here
    webpackOverride: (config) => config,
  });
```

Now we can select the composition we want to render, `ColorDemo` here, and render it using the [renderMedia()](https://www.remotion.dev/docs/renderer/render-media) function.

In our case, we can iterate over our datasets for the values of inputProps and pass them into the renderMedia() method like so:

```
import { getCompositions, renderMedia } from "@remotion/renderer";

for (var data of dataset) {
    inputProps['name'] = data['name'];
    inputProps['color'] = data['color'];

    const comps = await getCompositions(bundleLocation, {
        inputProps,
    });

    const compositionId = "ColorDemo";

    const composition = comps.find((c) => c.id === compositionId);

    if (!composition) {
        throw new Error(`No composition with the ID ${compositionId} found.
    Review "${entry}" for the correct ID.`);
    }

    const outputLocation = `out/${inputProps['name']}.mp4`;
    console.log("Attempting to render:", outputLocation);
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation,
        inputProps,
    });
};
```

(also make sure to take care that each output video gets a different output location)

The script can be run using node or ts-node (in case of typescript).
