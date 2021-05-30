---
title: Webpack dynamic imports
id: webpack-dynamic-imports
---

A common need in Remotion is to import assets from dynamic paths. This means that sometimes you don't know the exact path of an asset that should be imported upfront and you want to calculate it during runtime.

This can become an unexpected hurdle in Webpack. On this page we collect some tips how to handle dynamic assets.

## Write dynamic expressions correctly

Consider you have a PNG sequence of images with the following file structure:

```
my-video/
├─ src/
│  ├─ assets/
│  │  ├─ image0.png
│  │  ├─ image1.png
│  │  ├─ image2.png
│  │  ├─ ...
│  │  ├─ image99.png
│  ├─ index.tsx
```

Note that the following pattern doesn't work:

```tsx
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';

export const DynamicImports: React.FC = () => {
  const frame = useCurrentFrame();
  const img = './assets/image' + frame + '.png'
  return <Img src={require(img)} />;
};
```

```console
Error: Cannot find module './image0.png'
```

However the following example **does** work:

```tsx
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';

export const DynamicImports: React.FC = () => {
	const frame = useCurrentFrame();
	return <Img src={require('./assets/image' + frame + '.png')} />;
};
```

Webpack needs to figure out which assets it should bundle and cannot do it in the first example. However, it is smart enough to do so if you place your expression inside the `require()` or `import()` statement. In this case, Webpack will automatically bundle all `.png` files in the `assets/image` folder even if the asset is never used. Therefore you have to be careful to not bundle too many assets.

Please read [the Webpack documentation page](https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import) about this behavior if you would like to learn more.

## Import assets at runtime

Let's imagine a scenario where the asset that should be imported is completely unknown and will be read at runtime, for example through an [input prop](/docs/get-input-props):

```tsx
import {Img, getInputProps} from 'remotion';

const DynamicAsset: React.FC = () => {
  const inputProps = getInputProps() // {"imageSrc": "./assets/img0.png"}
  return <Img src={require(inputProps.imageSrc)}/>
}
```

This cannot work because Webpack has no ideas which assets it has to bundle. Therefore the import has to fail.
Like above, you can force Webpack to bundle the whole assets folder by putting an expression inside the `require()` statement:

```tsx
import {Img, getInputProps} from 'remotion';

const DynamicAsset: React.FC = () => {
  const inputProps = getInputProps() // {"imageSrc": "img0.png"}
  // Works!
  return <Img src={require('./assets/' + inputProps.imageSrc)}/>
}
```

## Adding assets after bundling

If you server-side render your video using the Node.JS APIs, you might find yourself in a situation where you want to add new assets after you have already bundled the Remotion application. In this scenario, it is simply impossible for Webpack to interpret a `require()` statement correctly.

You can use the following workaround that relies on the fact that Remotion creates a static web server while rendering:

1. [`bundle()`](/docs/bundle) the video - the return value is a promise resolving to the folder where the bundle got saved.
2. Copy a new asset into this folder.
3. Rely on the fact that the asset is available via the static HTTP server. Since you only want this during rendering, use the `process.env.NODE_ENV === 'production'` statement to differentiate between development and rendering.

```tsx
import {Img, getInputProps} from 'remotion';

export const DynamicAsset: React.FC = () => {
  const inputProps = getInputProps(); // {"imageSrc": "assets/img0.png"}
  return (
    <Img
      src={
        process.env.NODE_ENV === 'production'
          ? `/${inputProps.imageSrc}`
          : require('./assets/default-asset.png')
      }
    />
  );
}
```

## Set up an HTTP server

As a last resort, you can spin up your own static HTTP server and import the assets via HTTP:

```sh
# From any directory
npx serve --cors ./src
```

```tsx
import {Img, getInputProps} from 'remotion';

const HttpAsset: React.FC = () => {
  const inputProps = getInputProps(); // {"imageSrc": "assets/img0.png"}
  return <Img src={`http://localhost:5000/${inputProps.imageSrc}`} />
}
```

## Struggling?

If you still have troubles importing your assets, hit us up on [Discord](https://discord.com/invite/b3sDrFqa4Y) or file an issue. We'd love to hear your input about how we can improve and will help you out.
