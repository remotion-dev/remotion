---
title: npx remotion upgrade
sidebar_label: upgrade
---

Upgrades all Remotion-related packages.

```
npx remotion upgrade
```

## Package manager support

`npm`, `yarn` and `pnpm` are all supported.

## Difference to `npm update`, `yarn upgrade`, `pnpm up`

These commands, when executed without arguments will upgrade all dependencies in your project. We recommend against it because you may unintentionally break other parts of your project when you only wanted to upgrade Remotion.
