---
id: chromium-flags
title: Chromium flags
---

We allow you to set the following flags in Chromium and Google Chrome since Remotion 2.6.5:

## `--disable-web-security`

This will most notably disable CORS among other security features.

### Enabling in Node.JS APIs

In [`getCompositions()`](/docs/get-compositions), [`renderStill()`](/docs/render-still) and [`renderFrames()`](/docs/render-frames), you can pass [`chromiumOptions.disableWebSecurity`](/docs/render-still#disablewebsecurity).

## `--ignore-certificate-errors`

Results in invalid SSL certificates, such as self-signed ones being ignored.

### Enabling in Node.JS APIs

In [`getCompositions()`](/docs/get-compositions), [`renderStill()`](/docs/render-still) and [`renderFrames()`](/docs/render-frames), you can pass [`chromiumOptions.ignoreCertificateErrors`](/docs/render-still#ignorecertificateerrors).
