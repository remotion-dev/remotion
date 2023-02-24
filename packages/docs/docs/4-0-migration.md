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

## Dropped support for Lambda `architecture`

When deploying a Lambda, you were previously able to choose between the `arm64` and `x86_64` architecture.  
From v4.0 on, only `arm64` is supported. It should be faster, cheaper and not have any different behavior than `x86_64`.

**How to upgrade**: Remove the `architecture` option from `estimatePrice()` and `deployFunction()`.

## Rich timeline removed

The option to use the "Rich timeline" has been removed due to performance problems.  
The timeline is now always in simple mode, but supports more timeline layers at once.
