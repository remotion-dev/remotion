---
image: /generated/articles-docs-bun.png
id: bun
crumb: bun bun bun bun bun
title: Bun support
---

Remotion is excited about [Bun](https://bun.sh), and we mostly support it (from v1.0.3).

## As a package manager

You can use `bun i` to initialize all of our Remotion templates.  
To scaffold a new project with bun, use:

```
bun create video
```

Note that by default, Node.js will continue to be used as the runtime.

## As a runtime

As of Bun 1.0.14 and Remotion 4.0.43, the following issues are known:

- ⚠️ The `lazyComponent` prop on `<Composition>` and `<Player>` does not work, and this feature is automatically disabled.
- ⚠️ A server-side rendering script may not quit automatically after it is done running.
- ⚠️ In a GitHub Action running on Ubuntu, the stitching state is not reached and the workflow will freeze.

Feel free to file more issues with Remotion if you find them.

Previous issues listed here have been resolved as of Bun 1.0.3.

## For contributors

Start the example testbed using `bun run start-bun`.
