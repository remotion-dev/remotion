---
image: /generated/articles-docs-contributing-feature.png
title: Contributing your own presentation
crumb: Transition
---

Make your custom presentation accessible for others.

## Setup

If not already done, see the [CONTRIBUTING.md](https://github.com/remotion-dev/remotion/blob/main/CONTRIBUTING.md) file for instructions on how to set up the remotion project.

## How to proceed

1. Create a custom transition. Loook at the [custom presentation](/docs/transitions/presentations/custom) docs to see how it's done.
2. Add your presentation to the remotion monorepository under `packages/transitions/src/presentations`.
3. In the `rollup.config.js`, add your presentation to the `presentations` array.

```tsx
  const presentations = ['slide', 'flip', 'wipe', 'fade', ..., 'yourPresentation'];
```

4. Add your presentation to the `exports` of the `package.json` at `packages/transition/package.json` as well as to the `typesVersions`, so it can be correctly imported in other remotion projects.

```json
"exports": {
  "./yourPresentation": {
    "module": "./dist/presentations/yourPresentation.js",
    "import": "./dist/presentations/yourPresentation.js",
    "require": "./dist/cjs/presentations/yourPresentation.js",
    "types": "./dist/presentations/yourPresentation.d.ts"
    },
  },
  "typesVersions": {
	  ">=1.0": {
      "yourPresentation": [
        "dist/presentations/yourPresentation.d.ts"
      ],
    },
  }
```

Make sure to rebuild `remotion/packages/transitions` so your transition gets usable in your remotion repository.

5. Write a documentation for your presentation. Take a look at the presentations linked in the [presentation](/docs/transitions/presentations) docs to get an idea. The documentation should consist of:

   - A demo of your presentation. See [this](/docs/contributing/docs#demos) documentation for instructions on how to create a demo, or have a look at the source code of other presentation documentations ([presentationType].mdx files).
   - Example code showing how to use your presentation and a short description of what it does. See the [type safe snippets] docs for instructions on how to create a snippet.
   - The API of your presentation

## See also

- [Implementing a new feature](/docs/contributing/feature)
- [Writing documentation](/docs/contributing/docs)
- [How to take a bounty issue](/docs/contributing/bounty)
