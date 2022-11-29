---
title: npx remotion upgrade
sidebar_label: upgrade
crumb: CLI Reference
---

Upgrades all Remotion-related packages.

```
npx remotion upgrade
```

## Flags

### `--package-manager`

_optional since v3.2.33_

Forces a specific package manager to be used. This is useful if you are using Remotion in a monorepo and you want to upgrade all packages at once. By default, Remotion will auto-detect the package manager.

Acceptable values are `npm`, `yarn` and `pnpm`

## Package manager support

`npm`, `yarn` and `pnpm` are all supported.

## Difference to `npm update`, `yarn upgrade`, `pnpm up`

These commands, when executed without arguments will upgrade all dependencies in your project. We recommend against it because you may unintentionally break other parts of your project when you only wanted to upgrade Remotion.
