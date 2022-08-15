---
title: "TypeScript aliases"
id: typescript-aliases
slug: /typescript-aliases
---

Typescript aliases are not supported by default, since the ESBuild Webpack loader we have does not support them.
You can however patch the Webpack config to make them resolve.

Assuming you have a file:

```
 └── src/
   ├── lib/
   │   ├── one.ts
   │   ├── two.ts
   ├── Video.tsx
   └── index.ts
```

and your tsconfig.json has the following `paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "lib/*": ["./src/lib/*"]
    }
  }
}
```

you can add the aliases to Webpack, however you need to add each of them manually:

```ts twoslash
import path from "path";
import { Config } from "remotion";

Config.Bundling.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        lib: path.join(process.cwd(), "src", "lib"),
      },
    },
  };
});
```

Remember that in Node.JS APIs, the config file does not apply, so you need to add the Webpack override also to the [`bundle()`](/docs/bundle) and [`deploySite()`](/docs/lambda/deploysite) functions.

## See also

- [Overriding webpack config](/docs/webpack)
