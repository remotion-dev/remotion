# @remotion/browser-bundler

Experimental browser-side bundling for virtual Remotion projects. Compile source snapshots, then use `@remotion/browser-bundler/runtime` to select a registered composition for your own UI, such as a Remotion Player.

```sh
npm install @remotion/browser-bundler
```

Requires a cross-origin-isolated browser page and worker/WebAssembly asset support in your app's bundler. The runtime executes trusted code with host-page privileges; it is not a sandbox.

[Documentation](https://www.remotion.dev/docs/browser-bundler)
