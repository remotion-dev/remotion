---
id: render-all
title: Render all compositions
---

In some scenarios, you might find it useful to render all compositions.

## Via CLI

You can combine the [`npx remotion compositions`](/docs/cli/compositions) command with a bash loop:

```sh title="render-all.sh"
compositions=($(npx remotion compositions src/index.tsx -q))

for composition in "${compositions[@]}"
do
  npx remotion render src/index.tsx $composition $composition.mp4
done
```

You can execute it using:

```sh
sh ./render-all.sh
```

:::note
This only works on UNIX-based systems (Linux, macOS) and on WSL in Windows.
:::

## Via Node.JS script

You can create a script that fits you using the [Node.JS APIs](/docs/renderer). Below is an example

```ts twoslash title="render-all.ts"
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";

const start = async () => {
  const bundled = await bundle(
    require.resolve("./src/index.tsx"),
    () => undefined,
    {
      // If you have a Webpack override, make sure to add it here
      webpackOverride: (config) => config,
    }
  );

  const compositions = await getCompositions(bundled);

  for (const composition of compositions) {
    console.log(`Rendering ${composition.id}...`);
    await renderMedia({
      codec: "h264",
      composition,
      serveUrl: bundled,
      outputLocation: `out/${composition.id}.mp4`,
    });
  }
};

start()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
```

## See also

- [Render your video](/docs/render)
- [@remotion/renderer](/docs/renderer)
