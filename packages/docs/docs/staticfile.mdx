---
image: /generated/articles-docs-staticfile.png
id: staticfile
title: staticFile()
crumb: "API"
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
│  ├─ Root.tsx
│  ├─ index.ts
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
- It avoids conflicts with composition names which might share the same name (for example `http://localhost:3000/conflicting-name` while running the studio)
- It allows us to make paths framework-agnostic, so your code can work across Remotion, Create React App, Next.JS and potentially other frameworks.

## Getting all files in the public folder

Use the [`getStaticFiles()`](/docs/getstaticfiles) API to get a list of available options.

## Handling URI-unsafe characters<AvailableFrom v="4.0.0"/>

Since `v4.0`, `staticFile()` encodes the filename using `encodeURIComponent`.  
If you encoded the path by yourself until now, make sure to drop your encoding before passing the path into `staticFile()` to avoid double encoding.

Before `v4.0`, `staticFile()` did not handle URI-unsafe characters contained in the provided path. This could lead to problems in some cases when filenames would contain characters such as `#`, `?` and or `&`.

### Example

```tsx title="Before v4"
staticFile("my-image#portrait.png"); //output: "/my-image#portrait.png"
```

If this URL is passed to a component accepting an URL, the part after `#` will be left out, leading
to an error because the file can't be found.

```tsx title="Since v4.0.0"
staticFile("my-image#portrait.png"); // "/my-image%23portrait.png"
```

The image will now be loaded properly, however, you must avoid to encode the filename yourself.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/static-file.ts)
- [Loading assets](/docs/assets)
- [`getStaticFiles()`](/docs/getstaticfiles)
- [`watchStaticFile()`](/docs/watchstaticfile)
