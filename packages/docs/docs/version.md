---
image: /generated/articles-docs-version.png
id: version
title: VERSION
crumb: "API"
---

You may import this constant from `remotion` to get the current version of Remotion.  
This can be useful for displaying the Remotion version number in your application or for other version-specific operations.

If you have a version mismatch, this will report the version of the `remotion` NPM package.

```ts twoslash title="version.ts"
import { VERSION } from "remotion";

console.log(`Using Remotion version ${VERSION}`); // "4.0.57";
```

You can also import it from `remotion/version` to avoid importing the rest of Remotion and avoiding the React dependency:

```ts twoslash title="version.ts"
import { VERSION } from "remotion/version";

console.log(`Using Remotion version ${VERSION}`); // "4.0.57";
```

## See also

- [Source code for this constant](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/version.ts)
