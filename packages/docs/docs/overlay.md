---
id: prores-overlay
title: Overlay
---

If you want to export a remotion video to use it as an overlay or transition in an conventional video editing software, you can export it as an Apple ProRes file, which is supported by Final Cut Pro, Adobe Premiere and Davinci Resolve. Make sure your composition has no background color!

## Exporting a video as ProRes file

To export the video as ProRes file, you can setup the remotion.config.ts file as follows

```tsx twoslash
import { Config } from "remotion";

Config.Rendering.setImageFormat("png");
Config.Output.setPixelFormat("yuva444p10le");
Config.Output.setCodec("prores");
Config.Output.setProResProfile("4444");
```

and trigger the render with

```bash
npx remotion render
```

Alternatively, you can set the settings directly on the command line:

```bash
npx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444
```

## See an example

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

Now, you can simply import the video into your video editing software. You can find the video in the out folder from your remotion project.

import { OverlayInDavinci } from "../components/OverlayInDavinci";

<OverlayInDavinci/>
