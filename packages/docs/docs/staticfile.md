---
id: staticfile
title: staticFile()
---

_Available from v2.5.7._

Turns a file in your `public/` folder into an URL which you can then load into your project.

```tsx twoslash
import { Img, staticFile } from "remotion";

const myImage = staticFile(`/my-image.png`);

// ...

<Img src={myImage} />;
```

## Example

Start by creating a `public/` folder in the root of your video project:

```txt
my-video/
├─ node_modules/
├─ public/
│  ├─ my-image.png
│  ├─ font.woff2
├─ src/
│  ├─ Video.tsx
│  ├─ index.tsx
├─ package.json
```

:::info
The `public/` folder should always be in the same folder as your `package.json` that contains the `remotion` dependency, even if your Remotion code lives in a subdirectory.
:::

Get an URL reference of your asset:

```tsx twoslash
import { staticFile } from "remotion";

const myImage = staticFile(`/my-image.png`); // "/static-32e8nd/my-image.png"
const font = staticFile(`/font.woff2`); // "/static-32e8nd/font.woff2"
```

You can now load the asset via:

- [`<Img />`](/docs/img), [`<Audio/>`](/docs/audio), [`<Video/>`](/docs/video) tag
- Fetch API
- [FontFace()](/docs/fonts)
- Any other loader that supports data fetching via URL

## Why can't I just pass a string?

If you are a Create React App or Next.JS user, you might be used to just to be able to reference the asset from a string: `<img src="/my-image.png"/>`. Remotion chooses to be different in that you need to use the `staticFile()` API because:

- It prevents breaking when deploying your site into a subdirectory of a domain: `https://example.com/my-folder/my-logo.png`
- It avoids conflicts with composition names which might share the same name (for example `http://localhost:3000/conflicting-name` while running the preview)
- It allows us to make paths framework-agnostic, so your code can work across Remotion, Create React App, Next.JS and potentially other frameworks.

## URL encoding

If you import a file via this API, a URL is generated. Therefore you have to make sure to encode non-URL-safe characters in your filename.  
If on your filesystem, file is named `Video #1.mp4`, in your code you should import it using `staticFile("Video%20%201.mp4")`.  
You can achieve this via the browser-built-in `encodeURIComponent()` function: `staticFile(encodeURIComponent("Video #1.mp4"))`.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/static-file.ts)
- [Loading assets](/docs/assets)
