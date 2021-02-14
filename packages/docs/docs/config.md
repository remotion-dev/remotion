---
id: config
title: Configuration file
---

Create a `remotion.config.ts` file in the root of your Remotion project.

You can control several behaviors of Remotion here.

```tsx
import {Config} from 'remotion';

Config.PixelFormat.setPixelFormat('yuv444p');
```
