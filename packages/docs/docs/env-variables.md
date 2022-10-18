---
id: env-variables
title: Environment variables
---

_Available from v2.1.2._

Remotion supports environment variables being passed directly from the CLI, using a `.env` file and from the [`renderMedia()`](/docs/renderer/render-media) function.

## Passing variables from the CLI

If you want to pass an environment variable from the CLI, you need to prefix it with `REMOTION_`. This is a security feature to prevent your whole environment which could contain sensitive information being included in a Webpack bundle.

You can pass environment variables in development mode and while rendering. For example:

```bash
REMOTION_MY_VAR=hello_world npm start
```

In your project, you can access the variable using `process.env.REMOTION_MY_VAR`.

## Using a dotenv file

[Dotenv](https://www.npmjs.com/package/dotenv) support is built in. Simply place a `.env` file in the root of your project and place key-value pairs in it.

For example, if your file contains

```ini title=".env"
MY_VAR=hello
ANOTHER_VAR=world
```

in your project you can read `process.env` to get an object `{"MY_VAR": "hello", "ANOTHER_VAR": "world"}`.

You can override the location of your dotenv file using the [configuration file setting](/docs/config#setdotenvlocation) or the [CLI flag](/docs/cli).

## Setting via `renderMedia()`

The above two methods only work when rendering from the CLI. To pass environment variables while server-side-rendering, pass an object to the [`envVariables` option of `renderMedia()`](/docs/renderer/render-media#envvariables).

## See also

- [`renderMedia()` - envVariables](/docs/renderer/render-media#envvariables)
- [`renderFrames()` - envVariables](/docs/renderer/render-frames#envvariables)
- [`renderStill()` - envVariables](/docs/renderer/render-still#envvariables)
- [dotenv](https://www.npmjs.com/package/dotenv)
