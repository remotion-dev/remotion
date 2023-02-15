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

## ProRes videos now export uncompressed audio by default

Previously, the `aac` audio codec was the default for ProRes exports. The default is now `pcm_s16le` which stands for uncompressed 16-bit low-endian PCM audio. This change was made since users export ProRes mainly for getting high-quality footage to be further used in video editing programs.
