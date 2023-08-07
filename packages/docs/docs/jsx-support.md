---
image: /generated/articles-docs-jsx-support.png
id: javascript
title: Plain JavaScript
crumb: "How To"
---

Since Remotion 1.3, you can opt out of Typescript and it's type checking advantages in Remotion. Continue at your own risk.

## Opting out of Typescript

You may import `.js` and `.jsx` files as normal. If you would like to completely move to JS, rename `index.ts` and `Root.tsx` so they have a `.jsx` file extension. Remove types such as `React.FC` and `SpringConfig`.

## Upgrading

If you upgrade from Remotion 1.2 or older, consider changing the `npm test` command to also include JavaScript files, and to remove the `tsc` command:

```diff
-  "test": "eslint src --ext ts,tsx && tsc"
+  "test": "eslint src --ext ts,tsx,js,jsx"
```

## See also

- [Custom Webpack config](/docs/webpack) for more advanced tweaking
