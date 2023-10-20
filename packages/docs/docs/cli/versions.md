---
image: /generated/articles-docs-cli-versions.png
title: npx remotion versions
sidebar_label: versions
crumb: CLI Reference
---

_Available from Remotion v2.6.2_

Prints out which versions of Remotion packages are installed.

```
npx remotion versions
```

In the optimal case, your versions are aligned and the output of the command looks like this:

```
On version: 3.0.19
- @remotion/bundler
- @remotion/cli
- @remotion/eslint-config
- @remotion/renderer
- @remotion/media-utils
- @remotion/babel-loader
- @remotion/lambda
- @remotion/three
- @remotion/gif
- remotion

✅ Great! All packages have the same version.
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cli/src/versions.ts)
