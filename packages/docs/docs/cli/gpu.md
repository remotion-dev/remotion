---
crumb: CLI Reference
sidebar_label: gpu
title: npx remotion gpu
---

_Available from Remotion v4.0.52_

Prints out how the Chrome browser uses the GPUs.

```bash
npx remotion gpu
```

```bash title="Example output"
Canvas: Hardware accelerated
Canvas out-of-process rasterization: Enabled
Direct Rendering Display Compositor: Disabled
Compositing: Hardware accelerated
Multiple Raster Threads: Enabled
OpenGL: Enabled
Rasterization: Hardware accelerated
Raw Draw: Disabled
Skia Graphite: Disabled
Video Decode: Hardware accelerated
Video Encode: Hardware accelerated
WebGL: Hardware accelerated
WebGL2: Hardware accelerated
WebGPU: Hardware accelerated
```

The output should not be used for automated parsing, as it may change inbetween any Remotion and Chrome versions.

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cli/src/gpu.ts)
