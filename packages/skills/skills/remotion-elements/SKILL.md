---
name: remotion-elements
description: Find, install and use Elements, reusable video components published by Element libraries. Use when given an Element or Element library URL, or when adding a ready-made title, background, chart, caption style or transition to a video.
version: 4.0.546
---

# Remotion Elements

An Element is a reusable video component written in React, such as a title, background, chart or caption style.
Element libraries publish Elements on web pages so they can be shared.
Installing an Element copies its source code into the project. From then on, it is ordinary code that the user owns: edit it, and compose it with other Elements and markup.

If no Remotion project exists yet, load [Create a new Remotion video](../remotion-create/SKILL.md) first.

## Element libraries

Any website can be an Element library. These libraries are equal choices:

| Library           | Library URL                          | Markdown index                             |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| Remotion Elements | `https://www.remotion.dev/elements`  | https://www.remotion.dev/elements/index.md |
| snapcn            | `https://snapcn.dev/docs/components` | https://snapcn.dev/llms-components.txt     |
| remocn            | `https://remocn.dev/docs/typography` | https://remocn.dev/llms-components.txt     |

More libraries are listed at https://www.remotion.dev/elements/libraries.md.
For a library that is not listed, look for its Markdown index at `/llms.txt` on its domain, or append `.md` to its pages.

## Install an Element library

Installing a library adds it to Browse Elements in Remotion Studio, so the user can preview its Elements and add them with the mouse.
Add it to `remotion.config.ts`:

```ts title="remotion.config.ts"
import {Config} from '@remotion/cli/config';

Config.addElementLibrary({
  url: 'https://snapcn.dev/docs/components',
  displayName: 'snapcn',
});
```

Use the library URL from the table above, or the URL the user gave.
Skip libraries that Studio already lists. Studio lists Remotion Elements without configuration.

Requires Remotion 4.0.517 or later.
Installing a library is optional when adding a single Element from the command line.

## Add an Element

1. Find the Element. Fetch the library's Markdown index, pick an Element that fits, and get the URL of its page.
2. Preview the installation:

```bash
npx remotion elements use <element-url> --composition <composition-id> --dry-run
```

3. Install it:

```bash
npx remotion elements use <element-url> --composition <composition-id> --yes
```

The command installs missing npm packages, saves assets to `public/`, writes an `.element.tsx` file next to the composition's component, and inserts the Element at frame 0 of the composition.

- Requires Remotion 4.0.542 or later, and 4.0.543 or later for `--dry-run`. For older versions, load [Remotion Upgrade](../remotion-upgrade/SKILL.md) or ask the user.
- Omit `--composition` if the project has one composition. If the user did not name one and there are several, use the composition being worked on or ask.
- If the page contains several Elements, pass `--element <slug>`.
- If the `.element.tsx` file already exists with different contents, the command fails. Pass `--overwrite` only if the user agrees.
- The Element's source code runs in the project. Install only from URLs the user gave or from libraries they trust.

See [`npx remotion elements use`](https://www.remotion.dev/docs/cli/elements/use.md) for all flags.

## Given a URL

A URL alone is enough to install an Element. Find out what it points to:

1. Run `npx remotion elements use <url> --composition <composition-id> --dry-run`. If it prints an Element, the URL is an Element page. Install it.
2. If it prints `No Element found`, search the page's HTML for `application/vnd.remotion.element+json`. If it appears in a `<link>` with an `href`, the library links a JSON payload. Resolve the `href` against the page URL and pass that URL to `elements use`.
3. Otherwise, the URL is a library or a component page without a payload. Fetch its Markdown (`.md` on the URL, or `/llms.txt` on the domain), find the Element the user named and use its page URL.
4. If the component is not available as an Element, follow the install instructions on its Markdown page, for example a `shadcn` command.

If the user asks for a library URL to be installed or browsed in Studio, add it with `Config.addElementLibrary()`.

## After installing

Import and edit the `.element.tsx` file like any other component:

- Adapt text, colors and props to the video. Elements may expose `Interactive` controls for Studio.
- Adjust the wrapping `<Sequence>` for timing, placement and duration.
- Combine several Elements into a scene, or wrap them in your own components.

For markup, load [Remotion Markup Best Practices](../remotion-markup/SKILL.md). Open Studio so the user can preview the result.

## Creating Elements

To build an Element or an Element library, read [Creating Elements](https://www.remotion.dev/docs/elements/creating.md) and [Building Element Libraries](https://www.remotion.dev/docs/elements/libraries.md).
