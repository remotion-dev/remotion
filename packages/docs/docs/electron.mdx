---
image: /generated/articles-docs-electron.png
id: electron
sidebar_label: 'Integration into Electron'
title: 'Using Remotion in Electron'
crumb: 'Integrations'
---

# Using Remotion in Electron

<ExperimentalBadge>
<p>Use the official template as a reference. Your final setup will depend on your bundler, packaging target, and platform-specific requirements.</p>
</ExperimentalBadge>

The official [Electron template](/templates/electron) is the recommended baseline.

Use this page for the caveats of Electron integration, not as a strict setup guide. App structure, installers, code signing, auto-updates, and packaging hooks differ between apps.

## Use the template as a reference

The template shows a packaged-render flow that works with Electron Forge and Vite:

- Keep the Remotion project in `remotion/`
- Trigger renders from the renderer over IPC
- Run [`selectComposition()`](/docs/renderer/select-composition) and [`renderMedia()`](/docs/renderer/render-media) in the Electron main process
- Build the Remotion bundle during packaging, not at packaged runtime

The exact packaging setup may differ in your app.

## Render in the main process

The renderer should not call [`renderMedia()`](/docs/renderer/render-media) directly.

Expose a small API from `preload.ts`, then let the Electron main process perform the render. This keeps browser downloads, filesystem access, save dialogs, and packaged binary paths out of your UI code.

## Development and packaged apps

In development, it is common to call [`bundle()`](/docs/bundle) on demand so composition changes are picked up immediately.

In packaged apps, do not call [`bundle()`](/docs/bundle) at runtime. Build the Remotion bundle during the package step and load that prebuilt directory from the app.

## Compositor binaries

Use [`binariesDirectory`](/docs/renderer/render-media#binariesdirectory) for packaged renders and point it at a compositor package inside `app.asar.unpacked`.

Remotion binaries must not be loaded from inside `app.asar`.

Some Electron packaging setups copy optional binary dependencies automatically. Others do not. If your packaging tool does not include the compositor package, stage it during packaging.

## Platform-specific caveats

### Browser download

The first render may download Chrome Headless Shell.

If your app expects users to render soon after launch, you can call [`ensureBrowser()`](/docs/renderer/ensure-browser) ahead of time, for example in the background after startup.

If rendering is behind a login wall, a purchase step, or another user action, you may prefer to wait until the user actually starts a render.

If you want to avoid a first-use download in packaged builds, you can also treat the browser as a packaged asset. Call [`ensureBrowser()`](/docs/renderer/ensure-browser) during packaging, copy the downloaded browser into `app.asar.unpacked`, and pass its path through the `browserExecutable` option in your packaged renders.

The official [Electron template](/templates/electron) leaves this disabled by default. Set `REMOTION_ELECTRON_PACKAGE_BROWSER=true` during packaging if you want packaged renders to work completely offline. This will increase the final app size significantly.

This is not supported for macOS universal builds. [`ensureBrowser()`](/docs/renderer/ensure-browser) only downloads a browser for the current architecture, so the other packaged architecture would not get an offline browser. For universal builds, prefer calling [`ensureBrowser()`](/docs/renderer/ensure-browser) at runtime instead.

If you download the browser lazily during rendering, surface this progress in your UI.

### macOS universal builds

Universal packaging needs both macOS compositor packages available during packaging.

If your packaging flow produces a universal app from separate x64 and arm64 app bundles, the universal merge step may need an allowlist for architecture-specific binaries. Electron Forge exposes this through `packagerConfig.osxUniversal`.

### Linux variants

Like on other platforms, the packaged app must include a native compositor binary that matches the target system.

Linux needs extra care because there are multiple supported variants within Linux itself. Besides CPU architecture, you may also need a different binary for `glibc`-based distributions such as Ubuntu and Debian than for `musl`-based distributions such as Alpine.

Remotion ships separate Linux compositor packages for those environments, for example `@remotion/compositor-linux-x64-gnu` and `@remotion/compositor-linux-x64-musl`.

During packaging, include the compositor package that matches the Linux variant you ship for and stage it into `app.asar.unpacked`. If you distribute separate builds for Ubuntu/Debian and Alpine, package each build with its matching compositor package.

The official [Electron template](/templates/electron) accounts for this by selecting the compositor package that matches the libc of the machine doing the packaging. This works when you package on the same Linux family that you target, but it does not produce one Linux artifact that works on both `glibc` and `musl`.

This matters because the packaged app loads a native compositor binary. A `glibc` binary may fail on a `musl` system, and vice versa.

### Installers and code signing

Code signing, notarization, installers, auto-updates, and sandboxing are app-specific. The template does not try to standardize those parts.

## Setup differs by app

Electron Forge is a good baseline, but it is not the only valid setup.

Your app may use Electron Builder, a different renderer stack, a custom preload API, or a different packaging flow. The important part is to keep Remotion rendering in the main process and make packaged binary paths explicit.

## See also

- [`bundle()`](/docs/bundle)
- [`renderMedia()`](/docs/renderer/render-media)
- [`selectComposition()`](/docs/renderer/select-composition)
- [`binariesDirectory`](/docs/renderer/render-media#binariesdirectory)
- [Server-side rendering example](/docs/ssr-node)
- [Electron Forge](https://www.electronforge.io/)
- [Electron Forge Vite plugin](https://www.electronforge.io/config/plugins/vite)
