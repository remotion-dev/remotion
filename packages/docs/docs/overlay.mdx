---
image: /generated/articles-docs-overlay.png
id: overlay
title: Creating overlays
---

If you want to export a Remotion video to use it as an overlay or transition in a conventional video editing software, you can export it as a transparent Apple ProRes file, which is supported by Final Cut Pro, Adobe Premiere and Davinci Resolve.

## Exporting a video as ProRes file

<InlineStep>1</InlineStep> Make sure your composition has no background color. If you toggle the transparency option on in the editor, you should see a checkerboard background. <br /> <br/>

<InlineStep>2</InlineStep> To export the video as ProRes file, setup the <code>remotion.config.ts</code> file as follows: <br/><br/>

```tsx twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
```

and trigger the render with

```bash
npx remotion render
```

Alternatively, you can set the settings directly on the command line:

```bash
npx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444
```

## Use a template

import { OverlayDemo } from "../components/OverlayDemo";

```twoslash include example
const MyVideo: React.FC<{
  transparent: boolean;
}> = ({transparent}) => {
  return (
    <div style={{backgroundColor: transparent ? undefined : 'white', flex: 1}}>
      {/* Omit opaque background based on `transparent` prop */}
    </div>
  )
}
// - MyVideo
```

<OverlayDemo/>

## Use it in your Video Editor

Now, you can simply import the video into your video editing software. You can find the video in the out folder of your Remotion project.

import { OverlayInDavinci } from "../components/OverlayInDavinci";

<OverlayInDavinci/>

## See also

- [Transparent videos](/docs/transparent-videos)
