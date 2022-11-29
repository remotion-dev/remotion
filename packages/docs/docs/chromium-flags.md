---
id: chromium-flags
title: Chromium flags
crumb: "Tweaks"
---

import {AngleChangelog} from '../components/AngleChangelog';

We allow you to set the following flags in Chromium and Google Chrome since Remotion 2.6.5:

## `--disable-web-security`

This will most notably disable CORS among other security features.

:::note
Remotion will automatically append the `--user-data-dir` flag.
:::

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#disablewebsecurity), [`renderStill()`](/docs/renderer/render-still#disablewebsecurity), [`renderMedia()`](/docs/renderer/render-media#disablewebsecurity), [`renderFrames()`](/docs/renderer/render-frames#disablewebsecurity), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#disablewebsecurity) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#disablewebsecurity), you can pass [`chromiumOptions.disableWebSecurity`](/docs/renderer/render-still#disablewebsecurity).

### Via CLI flag

Pass [`--disable-web-security`](/docs/cli/render#--disable-web-security) in one of the following commands: `remotion render`, `remotion still`, `remotion lambda render`, `remotion lambda still`.

### Via config file

Use [setChromiumDisableWebSecurity()](/docs/config#setchromiumdisablewebsecurity).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumDisableWebSecurity(true);
```

## `--ignore-certificate-errors`

Results in invalid SSL certificates, such as self-signed ones, being ignored.

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#ignorecertificateerrors), [`renderStill()`](/docs/renderer/render-still#ignorecertificateerrors), [`renderMedia()`](/docs/renderer/render-media#ignorecertificateerrors), [`renderFrames()`](/docs/renderer/render-frames#ignorecertificateerrors), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#ignorecertificateerrors) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#ignorecertificateerrors), you can pass [`chromiumOptions.ignoreCertificateErrors`](/docs/renderer/render-still#ignorecertificateerrors).

### Via CLI flag

Pass [`--ignore-certificate-errors`](/docs/cli/render#--ignore-certificate-errors) in one of the following commands: `remotion render`, `remotion still`, `remotion lambda render`, `remotion lambda still`.

### Via config file

Use [setChromiumIgnoreCertificateErrors()](/docs/config#setchromiumignorecertificateerrors).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumIgnoreCertificateErrors(true);
```

## `--disable-headless`

Setting this flag will open an actual Chrome during render where you can see the render happen.

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#headless), [`renderStill()`](/docs/renderer/render-still#headless), [`renderMedia()`](/docs/renderer/render-media#headless) and [`renderFrames()`](/docs/renderer/render-frames#headless), you can pass [`chromiumOptions.headless`](/docs/renderer/render-still#headless). You cannot set this option in Lambda.

### Via CLI flag

Pass [`--disable-headless`](/docs/cli/render#--disable-headless) in one of the following commands: `remotion render`, `remotion still`.

### Via config file

Use [setChromiumHeadlessMode()](/docs/config#setchromiumheadlessmode).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumHeadlessMode(false);
```

## `--gl`

<AngleChangelog />

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromium's default

**Default for local rendering**: `null`.  
**Default for Lambda rendering**: `"swangle"`.

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#gl), [`renderStill()`](/docs/renderer/render-still#gl), [`renderMedia()`](/docs/renderer/render-media#gl), [`renderFrames()`](/docs/renderer/render-frames#gl), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](/docs/renderer/render-still#gl).

### Via CLI flag

Pass [`--gl=swiftshader`](/docs/cli#gl) in one of the following commands: `remotion render`, `remotion still`, `remotion lambda render`, `remotion lambda still`.

### Via config file

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumOpenGlRenderer("swiftshader");
```

## Need more flags?

Open a [GitHub issue](https://github.com/remotion-dev/remotion/issues/new?assignees=&labels=&template=feature_request.md&title=) to request it.
