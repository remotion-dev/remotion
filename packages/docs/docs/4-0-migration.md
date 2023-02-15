---
image: /generated/articles-docs-4-0-migration.png
id: 4-0-migration
title: v4.0 Migration
crumb: "Version Upgrade"
---

When upgrading from Remotion 3 to Remotion 4, note the following changes and apply them to your project.

## How to upgrade

See the [changelog](https://remotion.dev/docs/changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```diff
- "remotion": "^3.3.43"
- "@remotion/bundler": "^3.3.43"
- "@remotion/eslint-config": "^3.3.43"
- "@remotion/eslint-plugin": "^3.3.43"
- "@remotion/cli": "^3.3.43"
- "@remotion/renderer": "^3.3.43"
+ "remotion": "4.0.0"
+ "@remotion/bundler": "4.0.0"
+ "@remotion/eslint-config": "4.0.0"
+ "@remotion/eslint-plugin": "4.0.0"
+ "@remotion/cli": "4.0.0"
+ "@remotion/renderer": "4.0.0"
```

Run `npm i `, `yarn` or `pnpm i` respectively afterwards.

## Removal of deprecated APIs

- `Config.setOutputFormat()` was deprecated in v1.4 and has now been removed. Use `setImageSequence()` and `setImageFormat()` and `setCodec()` instead.

- `downloadVideo()` does not work anymore, use `downloadMedia()` with the same API instead.

- `<MotionBlur>` has been removed. Use `<Trail>` instead.

- `getParts()` has been removed. Use `getSubpaths()` instead:

```tsx twoslash title="paths.ts"
import {
  getLength,
  getPointAtLength,
  getSubpaths,
  getTangentAtLength,
} from "@remotion/paths";

const path = "M 0 0 L 100 100";
const parts = getSubpaths(path[0]);
const length = getLength(parts[0]);
const start = getPointAtLength(parts[0], 0);
const end = getPointAtLength(parts[0], length);
const tangent = getTangentAtLength(parts[0], length / 2);
```
