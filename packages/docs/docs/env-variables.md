---
image: /generated/articles-docs-env-variables.png
id: env-variables
title: Environment variables
crumb: "How To"
---

_Available from v2.1.2._

Remotion supports environment variables being passed directly from the CLI, using a `.env` file and from the [`renderMedia()`](/docs/renderer/render-media) function.

## Passing variables from the CLI

If you want to pass an environment variable from the CLI, you need to prefix it with `REMOTION_`. This is a security feature to prevent your whole environment (which could contain sensitive information) being included in a Webpack bundle.

You can pass environment variables in development mode and while rendering. For example:

```bash
REMOTION_MY_VAR=hello_world npm start
```

In your project, you can access the variable using `process.env.REMOTION_MY_VAR`.

## Using a dotenv file

[Dotenv](https://www.npmjs.com/package/dotenv) support is built in if you use the CLI.

Place a `.env` file in the [root](/docs/terminology#remotion-root) of your project and fill it with key-value pairs.

```ini title=".env"
MY_VAR=hello
ANOTHER_VAR=world
```

In your Remotion project you can read `process.env` to get an object of environment variables: `{"MY_VAR": "hello", "ANOTHER_VAR": "world"}`.

You can override the location of your dotenv file using the [configuration file setting](/docs/config#setdotenvlocation) or the [CLI flag](/docs/cli).

## Using in Node.js APIs

When using the [Node.js APIs](/docs/renderer) such as [`renderMedia()`](/docs/renderer/render-media) or [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), the environment variables are **not** picked up automatically.

The reason is that one might integrate Remotion as a small part of a big application and if Remotion would read the `.env` file and pick up all secrets and forwards it to renders, it would lead to a security issue.

To pass environment variables while server-side-rendering, pass an object to the [`envVariables` option of `renderMedia()`](/docs/renderer/render-media#envvariables).

If you want to read the environment variables from a `.env` file, use the [dotenv](https://www.npmjs.com/package/dotenv) package.

## See also

- [`renderMedia()` - envVariables](/docs/renderer/render-media#envvariables)
- [`renderFrames()` - envVariables](/docs/renderer/render-frames#envvariables)
- [`renderStill()` - envVariables](/docs/renderer/render-still#envvariables)
- [dotenv](https://www.npmjs.com/package/dotenv)
