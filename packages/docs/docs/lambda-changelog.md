---
id: lambda-changelog
title: Changelog
slug: /lambda/changelog
---

Keep track of changes to the APIs of Remotion Lambda here.

## How to upgrade

1. Get the newest version from the `#lambda` Discord channel.
1. Upgrade all packages to the newest version (`@remotion/lambda`, but also `remotion`, `@remotion/cli` etc.)
1. Remove all existing lambdas: `npx remotion-lambda functions ls` and then `npx remotion-lambda functions rm <function-name>`
1. Redeploy your function: `npx remotion lambda functions deploy`
1. Migrate according to the changelog below:

## Unreleased

- `getDeployedLambdas()` was renamed to `getFunctions()`

## July 14th, 2021

- Emojis are now rendered using the Noto Color Emoji font
- Better price calculation
- Cleanup of S3 buckets after rendering

## July 6th, 2021

- You can now use `npx remotion lambda` instead of `npx remotion-lambda`.
- CLI supports the `-y` ('yes') flag for skipping confirmation of destructive commands.
- Stability, memory management and reliability improved
- Lambda runtime and Region selection now documented
- `renderVideoOnLambda()` and `getRenderProgress` now documented.
- `deployLambda()` has been renamed to `deployFunction()`
