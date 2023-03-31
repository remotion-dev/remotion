---
id: 4-0-alpha
title: v4.0 Alpha
crumb: "Version Upgrade"
---

Help us shape Remotion 4.0!

## What to test

We are mainly looking for feedback on the experience of the new Render button and the [interactive props editor](/docs/parametrized-rendering#define-a-schema-).

- Render button: Click the rocket icon <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{height: 16, verticalAlign: "text-bottom"}}><path d="M117.8 128H207C286.9-3.7 409.5-8.5 483.9 5.3c11.6 2.2 20.7 11.2 22.8 22.8c13.8 74.4 9 197-122.7 276.9v89.3c0 25.4-13.4 49-35.3 61.9l-88.5 52.5c-7.4 4.4-16.6 4.5-24.1 .2s-12.1-12.2-12.1-20.9l0-114.7c0-22.6-9-44.3-25-60.3s-37.7-25-60.3-25H24c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3zM424 128a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zM166.5 470C132.3 504.3 66 511 28.3 511.9c-16 .4-28.6-12.2-28.2-28.2C1 446 7.7 379.7 42 345.5c34.4-34.4 90.1-34.4 124.5 0s34.4 90.1 0 124.5zm-46.7-36.4c11.4-11.4 11.4-30 0-41.4s-30-11.4-41.4 0c-10.1 10.1-13 28.5-13.7 41.3c-.5 8 5.9 14.3 13.9 13.9c12.8-.7 31.2-3.7 41.3-13.7z"/></svg> while editing any video in the Remotion Preview.
- Interactive props editor: [Define a schema](/docs/parametrized-rendering#define-a-schema-) and then edit the schema in the right sidebar of the Remotion Preview.

We are also welcoming any bug reports about the other new features. See a list of [changes in v4.0 here](/blog/4-0).

## How to upgrade

See the [changelog](#changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```diff title="package.json"
- "remotion": "^3.3.43"
- "@remotion/bundler": "^3.3.43"
- "@remotion/eslint-config": "^3.3.43"
- "@remotion/eslint-plugin": "^3.3.43"
- "@remotion/cli": "^3.3.43"
- "@remotion/renderer": "^3.3.43"
+ "remotion": "4.0.0-alpha.115+764023ad5"
+ "@remotion/bundler": "4.0.0-alpha.115+764023ad5"
+ "@remotion/eslint-config": "4.0.0-alpha.115+764023ad5"
+ "@remotion/eslint-plugin": "4.0.0-alpha.115+764023ad5"
+ "@remotion/cli": "4.0.0-alpha.115+764023ad5"
+ "@remotion/renderer": "4.0.0-alpha.115+764023ad5"
```

Most important breaking changes:

<InlineStep>1</InlineStep> The config file must now import the config like the following:

```ts
import { Config } from "@remotion/cli/config";
```

<InlineStep>2</InlineStep> Also in the config file:

```ts
Config.setImageFormat("jpeg");
```

has been replaced with

```ts
Config.setVideoImageFormat("jpeg");
```

See how to migrate: [Migration guide](/docs/4-0-migration)

## Known issues

- The render queue does currently render multiple videos at once
- The render queue does not handle if the Preview Server is disconnected
- Saving input props has no progress indication
- Button for saving input props shows up even if saving is not possible
- Unserializable values in `defaultProps` make the JSON editor act up.

## Changelog

### `4.0.0-alpha.127+bcc7f944b`

Improve the saving back to code feature if you are using `as const`.

### `4.0.0-alpha.115+764023ad5`

Initial v4 alpha release
