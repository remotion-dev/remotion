---
image: /generated/articles-docs-bun.png
id: bun
crumb: bun bun bun bun bun
title: Bun support
---

Remotion is excited about [Bun](https://bun.sh), and we partially support it.

## As a package manager

You can use `bun i` to initialize all of our Remotion templates.  
To scaffold a new project with bun, use:

```
bun create video
```

Note that by default, Node.js will continue to be used as the runtime.

## As a runtime

As of Bun 1.0 and Remotion 4.0.37, the following issues are known:

- ⚠️ Compositions `lazyComponent`'s do not work in Bun yet.
- ⚠️ Reloading the Remotion Studio leads to a crash: `Cork buffer must not be held across event loop iterations!`
- ⚠️ Cannot render videos in the Remotion Studio

Feel free to file more issues with Remotion if you find them.
