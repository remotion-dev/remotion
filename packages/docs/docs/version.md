---
image: /generated/articles-docs-version.png
id: version
title: VERSION
crumb: "Tips and Tricks"
---

In Remotion, you can import the `VERSION` variable from `remotion/version` to access the current version number of the Remotion library without including the entire Remotion library and its dependencies (such as React). This can be useful for displaying the Remotion version number in your application or for other version-specific operations. This gives you the current Remotion version which is being used at the moment. You can also check it by importing the same and logging it in the console.

```ts twoslash title="Importing VERSION from remotion/version"
import { VERSION } from "remotion/version";

console.log(`Using Remotion version ${VERSION}`);

```
## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/version.ts)


