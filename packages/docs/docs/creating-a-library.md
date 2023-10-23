---
image: /generated/articles-docs-creating-a-library.png
id: authoring-packages
title: Authoring a Remotion library
sidebar_label: Authoring a library
crumb: "How to"
---

Authoring a Remotion library works the same as authoring a normal React library. Usually, it is being published to GitHub and NPM.

## Starter template

[Remotion's library starter template](https://github.com/remotion-dev/library-starter/) is the recommended way to create a library or a component to be used with Remotion. It:

- correctly packages your library as ESM + CJS
- has an Remotion Studio instance built in for testing your library
- correctly defines Remotion as a peer dependency
- has TypeScript, ESLint and Turborepo configured

## Publishing

You have three options to publish your library:

- **Publishing it for free to NPM**: The default for the starter template.
- **Sell it yourself via the NPM Kiosk**: See [NPM Kiosk](https://remotion.pro/npm-kiosk) for more info.
- **Apply to be listed in the [Remotion Store](https://www.remotion.pro/store)**: E-Mail [hi@remotion.dev](mailto:hi@remotion.dev) to pitch.

## See also

- [Contributing to Remotion](/docs/contributing)

<Credits contributors={[
{
username: "Just-Moh-it",
contribution: "Template and docs"
},
]} />
