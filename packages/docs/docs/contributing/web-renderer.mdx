---
image: /generated/articles-docs-contributing-web-renderer.png
title: Contributing to client-side rendering
sidebar_label: Web renderer
crumb: Contributing
---

The code for `@remotion/web-renderer` is located in the `packages/web-renderer` folder.  
Before running any of these commands, do the [main setup](/docs/contributing).

## Developing in watch mode

To develop the web renderer, you can use the watch mode:

```sh title="In ./"
bun run watchwebrenderer
```

This will automatically rebuild the package when you make changes to the code.

## Running tests

This package uses test-driven development. Changes are tested using [Vitest Browser Mode](https://vitest.dev/guide/browser/why.html).

First you need to install the browser dependencies:

```sh title="In packages/web-renderer"
bunx playwright install --with-deps
```

Then you can run the tests:

```sh
bun run testwebrenderer
```

To only run a specific test file, you can specify the file name:

```sh
bunx vitest src/test/video.test.tsx
```

To only run a specific test, you can change `test()` to `test.only()`.

To only run the test in a specific browser, you can specify the browser name:

```sh
bunx vitest --browser chromium
bunx vitest --browser firefox
bunx vitest --browser webkit
```

## Adding support for new styles

To fix a visual bug or add support for a new CSS property, first obtain some markup that does not look correct, then add it to the [`packages/web-renderer/src/test/fixtures`](https://github.com/remotion-dev/remotion/tree/main/packages/web-renderer/src/test/fixtures) folder.

Also add it to [`packages/web-renderer/src/test/Root.tsx`](https://github.com/remotion-dev/remotion/blob/main/packages/web-renderer/src/test/Root.tsx) so it is rendered in the Studio (`bun run studio`) - you can easily compare it to a server-side render or see how the browser renders it.

Then add a new test ([Example: `packages/web-renderer/src/test/transforms.test.tsx`](https://github.com/remotion-dev/remotion/blob/main/packages/web-renderer/src/test/transforms.test.tsx)) that renders the fixture in 3 different browsers and makes a screenshot of it.

When [running](#running-tests) the tests, it will fail the first time. This is because the expected screenshot is not yet available, but it will be generated the first time.

Update the code in [`packages/web-renderer/src/drawing`](https://github.com/remotion-dev/remotion/tree/main/packages/web-renderer/src/drawing) to add a new feature to the web renderer and run the tests again.

Once the screenshots look like they should, delete the screenshots originally created and run the tests again to generate new ones. Commit them and send a PR!

Also update the [/docs/client-side-rendering/limitations.mdx](/docs/client-side-rendering/limitations) documentation to document the support you added.

AI Agents like Claude Code can help you do most of this work. This is an example prompt that adds support for letter spacing and text transform for text:

> in packages/web-renderer/src/test/text.test.tsx, there is tests for drawing text. this is implemented in packages/web-renderer/src/drawing/text/handle-text-node.ts and a fixture is added in packages/web-renderer/src/test/Root.tsx. add support for letter spacing and text transform and add tests!

Remember to review AI-generated code and finetune it.  
Sloppy, unfiltered AI PRs will not be processed by us.

## Enabling the Studio Render Button

Enable the experimental client-side rendering flag in your `remotion.config.ts`:

```ts
import {Config} from '@remotion/cli/config';

Config.setExperimentalClientSideRenderingEnabled(true);
```

Or pass the `--enable-experimental-client-side-rendering` flag when starting the Studio:

```sh
npx remotion studio --enable-experimental-client-side-rendering
```

Now, in [`packages/example`](/docs/contributing/#testing-your-changes), and in any template, you will see a "Render on web" button.

## See also

- [Contributing to Remotion](/docs/contributing)
