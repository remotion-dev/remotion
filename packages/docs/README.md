# Website

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

Go to the root directory of the repository (`cd ../..` if you are in the `docs` directory) and run

```console
bun i
bun run build
```

## Local Development

In this directory (`packages/docs`), run:

```console
bun start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Generate top fonts

To update `font-picker.md` (https://www.remotion.dev/docs/font-picker) with the up to date font list, run:

```
node make-top-google-fonts.mjs 250
```

and paste it into the Markdown file. Repeat it with `100` and `25`.
