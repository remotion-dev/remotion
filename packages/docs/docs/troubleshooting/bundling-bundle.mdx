---
image: /generated/articles-docs-troubleshooting-bundling-bundle.png
sidebar_label: Calling bundle() in bundled code
title: Calling bundle() in bundled code
crumb: "Troubleshooting"
---

If you receive the following error:

```
 ⨯ ./node_modules/@remotion/bundler/node_modules/webpack/lib/FileSystemInfo.js:9:0
Module not found: Can't resolve 'module'
Did you mean './module'?
Requests that should resolve in the current directory need to start with './'.
```

or

```
 ⨯ ./node_modules/@remotion/compositor-darwin-arm64/remotion
Module parse failed: Unexpected character '�' (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```

it means that the [`bundle()`](/docs/bundle) function is being bundled itself for example by Webpack or ESBuild.

This occurs for example if [`bundle()`](/docs/bundle) or [`deploySite()`](/docs/lambda/deploysite) is being called in a Next.js serverless function.

To bundle the `bundle()` function, Webpack needs specific configuration, which is missing.

However, we don't recommend that you call `bundle()` at runtime at all.

## What you actually want

Most likely, you don't want to bundle your video at runtime, but rather at build time.

You only need to re-bundle the video if you change the source code of it. However, this should not be necessary at runtime, as you can parametrize everything without changing the source code.

See how to parametrize the [content with input props](/docs/passing-props) as well as the [metadata of your video](/docs/dynamic-metadata).

## Recipes

**If you are using a long-running server:** we recommend to call `bundle()` once in a Node.js context and then reusing it for the lifetime of the server. See: [Rendering in Node.js](/docs/ssr-node)

**If you are rendering on Lambda**: Create a bundle and deploy it once either via [`npx remotion sites create`](/docs/lambda/cli/sites#create) or using [`deploySite()`](/docs/lambda/deploysite) in a non-bundled Node.js script and then refer to the bundle via the URL that you get back.

In both cases, do all parameterization of the video using [input props](/docs/parameterized-rendering).

## See also

- [Rendering in Node.js](/docs/ssr-node)
- [Deploying a site](/docs/lambda/deploysite)
- [Parameterized rendering](/docs/parameterized-rendering)
- [`bundle()`](/docs/bundle)
- [`deploySite()`](/docs/lambda/deploysite)
