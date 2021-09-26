---
id: prereleases
slug: /prereleases
title: Testing prereleases
---

If you have received a prerelease version of Remotion, such as `"2.4.0-alpha.b886f9bc"`, this is how you install it:

Replace all packages that are part of Remotion, such as `remotion`, `@remotion/renderer`, `@remotion/lambda`, etc with the version that you have received:

```diff
- "@remotion/bundler": "^2.4.0"
+ "@remotion/bundler": "2.4.0-alpha.b886f9bc"
- "@remotion/renderer": "^2.4.0"
+ "@remotion/renderer": "2.4.0-alpha.b886f9bc"
- "remotion": "^2.4.0"
+ "remotion": "2.4.0-alpha.b886f9bc"
```

:::warning
Make sure that you remove the `^` character from the version. If you don't, you get the version with the alphabetically highest hash, which is a random version of Remotion rather than the one you want.
:::

Afterwards, run `yarn` or `npm i` respectively.
