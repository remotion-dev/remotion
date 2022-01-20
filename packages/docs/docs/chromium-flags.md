---
id: chromium-flags
title: Chromium flags
---

We allow you to set the following flags in Chromium and Google Chrome since Remotion 2.6.5:

## `--disable-web-security`

This will most notably disable CORS among other security features.

:::note
Remotion will automatically append the `--user-data-dir` flag.
:::

### Enabling in Node.JS APIs

In [`getCompositions()`](/docs/get-compositions), [`renderStill()`](/docs/render-still) and [`renderFrames()`](/docs/render-frames), you can pass [`chromiumOptions.disableWebSecurity`](/docs/render-still#disablewebsecurity).

### Enabling via CLI

Pass [`--disable-web-security`](/docs/cli#--disable-web-security) in a `remotion render` or `remotion still` command.

### Enabling via config file

Use [setChromiumDisableWebSecurity()](/docs/config#setchromiumdisablewebsecurity).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumDisableWebSecurity(true);
```

## `--ignore-certificate-errors`

Results in invalid SSL certificates, such as self-signed ones being ignored.

### Enabling in Node.JS APIs

In [`getCompositions()`](/docs/get-compositions), [`renderStill()`](/docs/render-still) and [`renderFrames()`](/docs/render-frames), you can pass [`chromiumOptions.ignoreCertificateErrors`](/docs/render-still#ignorecertificateerrors).

### Enabling via CLI

Pass [`--ignore-certificate-errors`](/docs/cli#--ignore-certificate-errors) in a `remotion render` or `remotion still` command.

### Enabling via config file

Use [setChromiumIgnoreCertificateErrors()](/docs/config#setchromiumignorecertificateerrors).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumIgnoreCertificateErrors(true);
```

## `--headless`

By default `true`. Disabling it will open an actual Chrome window where you can see the render happen.

## Enabling in Node.JS APIs

In [`getCompositions()`](/docs/get-compositions), [`renderStill()`](/docs/render-still) and [`renderFrames()`](/docs/render-frames), you can pass [`chromiumOptions.headless`](/docs/render-still#headless).

## Enabling via CLI

Pass [`--headless=false`](/docs/cli#headless) in a `remotion render` or `remotion still` command.

## Enabling via config file

Use [setChromiumHeadlessMode()](/docs/config#setchromiumheadlessmode).

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumHeadlessMode(false);
```
