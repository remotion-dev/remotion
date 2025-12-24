---
name: upgrade-mediabunny
description: Upgrade the Mediabunny dependency across the whole monorepo
---

To upgrade Mediabunny to a specific version:

1. Look in the root package.json and update the version of Mediabunny to the desired version.
2. Also upgrade @mediabunny/mp3-encoder to the same version.
3. Look in packages/template-\*/package.json and update the version of Mediabunny to the desired version.
4. Update `packages/docs/docs/mediabunny/version.mdx` compatiblity table. To find the next version this upgrade is going to be applied, look in the root package.json for the version and increment the patch version by one
5. Run `bun i` in the end.
