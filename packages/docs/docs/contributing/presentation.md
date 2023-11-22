---
image: /generated/articles-docs-contributing-feature.png
title: Contribute your own presentation
sidebar_label: Adding new presentations
crumb: Contributing
---

Make your custom presentation accessible for others in the `@remotion/transitions` package.

## Setup the remotion project

If this is your first contribution, see the <a href="https://github.com/remotion-dev/remotion/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a> file for general information and instructions on how to set up the remotion project.

## How to proceed

<Step>1</Step> Create a custom transition. Loook at the <a href="/docs/transitions/presentations/custom">custom presentation</a> docs to see how it's done.<br/>
<Step>2</Step>Add your presentation to the remotion monorepository under <code></code>packages/transitions/src/presentations`.<br/>
<Step>3</Step> In the <code></code>`rollup.config.js`, add your presentation to the `presentations` array.
<br/>

```tsx
  const presentations = ['slide', 'flip', 'wipe', 'fade', ..., 'yourPresentation'];
```

<Step>4</Step> Add your presentation to the <code>exports</code> of the <code>package.json</code> at <code>packages/transition/package.json</code> as well as to the <code>typesVersions</code>, so it can be correctly imported in other remotion projects.

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

<Step>5</Step> Write a documentation for your presentation. Have a lookat the presentations linked in the <a href="/docs/transitions/presentations">presentation</a> docs for reference. The documentation should consist of the following parts:

- A short description of what your presentation does.
- A demo of your presentation. For instructions, have a look at the [contributing to the documentation](/docs/contributing/docs#demos) page, or have a look at the source code of other presentation documentations ([presentationType].mdx files).
- An example code snippet showing how to use your presentation . See the [type safe snippets](/docs/contributing/docs#type-safe-snippets) docs for instructions on how to create typesafe code snippets.
- The API of your presentation

&nbsp;&nbsp;&nbsp;&nbsp; For more information on how to write documentation, see the [contributing to the documentation](/docs/contributing/docs) page.

## See also

- [Implementing a new feature](/docs/contributing/feature)
- [Writing documentation](/docs/contributing/docs)
- [How to take a bounty issue](/docs/contributing/bounty)
