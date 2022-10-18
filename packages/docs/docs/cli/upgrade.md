---
title: npx remotion upgrade
sidebar_label: upgrade
---

Upgrades all Remotion-related packages.

```
npx remotion upgrade
```

## Arguments

### `enforce-manager`

_optional since v3.2.33_

Allows you to enforce manager to be used for the upgrade. This is useful if you are using Remotion in a monorepo and you want to upgrade all packages at once. By default, Remotion will use the manager of `lockfile`.

## Package manager support

`npm`, `yarn` and `pnpm` are all supported.

## Difference to `npm update`, `yarn upgrade`, `pnpm up`

These commands, when executed without arguments will upgrade all dependencies in your project. We recommend against it because you may unintentionally break other parts of your project when you only wanted to upgrade Remotion.
