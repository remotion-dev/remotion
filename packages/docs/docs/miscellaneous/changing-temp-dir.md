---
image: /generated/articles-docs-miscellaneous-changing-temp-dir.png
sidebar_label: Temporary directory
title: Changing the temporary directory
crumb: "Advanced configuration"
---

During rendering, Remotion will write items into the temporary directory of the system. This includes rendered frames, uncompressed audio and other artifacts.

If you want to customize the directory that Remotion uses, you can set the `TEMP` environment variable to specify a directory to your liking.

```bash
TEMP=/var/tmp npx remotion render
```

Remotion will make a new temporary directory in the path that you have specified. This is because the Node.JS API [`os.tmpdir()`](https://github.com/nodejs/node/blob/58431c0e6bb1829b6ccafc5cf6340226c15da790/lib/os.js#L181) is called by Remotion which is checking for environment variables.

Changing the temporary directory may be useful if the default temporary directory is on a disk that has limited space available.
