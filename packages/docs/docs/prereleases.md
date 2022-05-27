---
id: prereleases
slug: /prereleases
title: Testing prereleases
---

import {Prerelease} from "../components/PrereleaseVersion"

<Prerelease />

:::warning
Make sure that you remove the `^` character from the version. If you don't, you get the version with the alphabetically highest hash, which is a random version of Remotion rather than the one you want.
:::

Afterwards, run `yarn`, `npm i` or `pnpm i` respectively.
