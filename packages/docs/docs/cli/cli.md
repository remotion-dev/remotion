---
title: Command line reference
sidebar_label: CLI reference
id: cli
---

import {AngleChangelog} from '../../components/AngleChangelog';

## How to use

- You can access the CLI by running `npx remotion` inside a npm project using remotion, `yarn remotion` inside a yarn project and `pnpm exec remotion` inside a pnpm project. For compactness, in the documentation we always say `npx remotion`.
- Inside an npm script, you don't need the `npx` prefix.

## Commands

The following commands are available - you can always run them using `npx remotion` or even without the `npx` prefix if you put the command inside an npm script.

- [`npx remotion preview`](/docs/cli/preview)
- [`npx remotion render`](/docs/cli/render)
- [`npx remotion still`](/docs/cli/still)
- [`npx remotion compositions`](/docs/cli/compositions)
- [`npx remotion upgrade`](/docs/cli/upgrade)
- [`npx remotion versions`](/docs/cli/versions)
- [`npx remotion lambda`](/docs/lambda/cli)

## Example command

```
npx remotion render --codec=vp8 src/index.tsx HelloWorld out/video.webm
```

## Fig.io autocompletion

Install [Fig](https://fig.io) (macOS only) to add Remotion autocomplete to your terminal. Type `npx remotion` to start get suggestions.

## See also

- [Render your video](/docs/render)
- [Configuration file](/docs/config)
