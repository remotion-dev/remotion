---
name: upgrade-caniuse
description: Upgrade the caniuse-lite override in the Remotion repo. Use when asked to update caniuse-lite to the latest npm version.
---

- Ensure we are on the `main` branch and status is clean.
- In the root `package.json`, find the `overrides` section and update `caniuse-lite` to the latest npm version.
- Look up the latest version with npm.
- Run `bun i`.
- Commit with `Upgrade caniuse-lite to <version>` and push.
