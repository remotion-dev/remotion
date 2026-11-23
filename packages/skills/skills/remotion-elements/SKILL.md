---
name: remotion-elements
description: Installs Elements, reusable video components such as titles, backgrounds, charts and caption styles, from Element libraries like Remotion Elements, snapcn and remocn into a Remotion project with `npx remotion elements use`, and registers Element libraries in Remotion Studio. Use when given an Element page URL or an Element library URL, or when a video needs a ready-made component.
version: 4.0.546
---

# Remotion Elements

An Element is a reusable video component written in React.
Element libraries publish each Element on its own page, the Element page.
Installing an Element copies its source code into the project, where the user owns it: edit it like any other component and compose it with other Elements.

If no Remotion project exists yet, load [Create a new Remotion video](../remotion-create/SKILL.md) first.

## Element libraries

Any website can be an Element library. These libraries are peers:

| Element library   | Library URL                          | Markdown index                             |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| Remotion Elements | `https://www.remotion.dev/elements`  | https://www.remotion.dev/elements/index.md |
| snapcn            | `https://snapcn.dev/docs/components` | https://snapcn.dev/llms-components.txt     |
| remocn            | `https://remocn.dev/docs/typography` | https://remocn.dev/llms-components.txt     |

More Element libraries are listed at https://www.remotion.dev/elements/libraries.md.
For any other Element library, find its Markdown index at `/llms.txt` on its domain, or append `.md` to its pages.

## Install an Element library

Installing an Element library lists it in Browse Elements in Remotion Studio, where the user can preview its Elements and drag them into a composition.
Add one `Config.addElementLibrary()` call per Element library to `remotion.config.ts`:

```ts title="remotion.config.ts"
import {Config} from '@remotion/cli/config';

Config.addElementLibrary({
  url: 'https://snapcn.dev/docs/components',
  displayName: 'snapcn',
});
```

- Use the library URL from the table, or the URL the user gave.
- Studio lists Remotion Elements without configuration. Do not add it.
- Requires Remotion 4.0.517 or later.

Installing an Element library is not required to add an Element.

## Add an Element

Copy this checklist and track progress:

```
- [ ] 1. Get the Element page URL
- [ ] 2. Dry run succeeds
- [ ] 3. Element installed
- [ ] 4. Element adapted and previewed
```

### 1. Get the Element page URL

- **Given an Element page URL:** use it.
- **Given an Element library URL or a name:** fetch the library's Markdown index, pick the Element the user asked for, and use its Element page URL.
- **Not given anything:** search the Markdown indexes of the Element libraries above for an Element that fits the video.

### 2. Dry run

Run exactly:

```bash
npx remotion elements use <element-page-url> --composition <composition-id> --dry-run
```

Read the output and fix the cause before continuing:

- **`No Element found`:** search the page's HTML for `application/vnd.remotion.element+json`. If a `<link>` with that type has an `href`, resolve the `href` against the Element page URL and dry run that JSON URL instead. If there is no payload, the component is not an Element: follow the install instructions on its Markdown page instead, for example a `shadcn` command, and skip to step 4.
- **Several Elements on the page:** add `--element <slug>`.
- **Composition IDs listed:** pass the composition the user is working on. If that is unclear, ask.
- **`elements use` or `--dry-run` not recognized:** Remotion is older than 4.0.543. Load [Remotion Upgrade](../remotion-upgrade/SKILL.md) or ask the user.

Repeat until the dry run prints the Element, the files it creates and changes, the packages and the assets.

### 3. Install

Run the same command with `--yes` instead of `--dry-run`:

```bash
npx remotion elements use <element-page-url> --composition <composition-id> --yes
```

The command installs missing packages, saves assets to `public/`, writes an `.element.tsx` file next to the composition's component and inserts the Element at frame 0.

- If the `.element.tsx` file already exists with different contents, the command fails. Add `--overwrite` only if the user agrees.
- The Element's source code runs in the project. Install only from Element page URLs the user gave or from Element libraries the user trusts.

### 4. Adapt and preview

- Adapt the text, colors and props to the video.
- Adjust the wrapping `<Sequence>` for timing and placement.
- Load [Remotion Markup Best Practices](../remotion-markup/SKILL.md) before editing the markup.
- Open the composition in Studio and check that the Element renders. Fix errors and check again.

## Reference

- [`npx remotion elements use`](https://www.remotion.dev/docs/cli/elements/use.md): all flags
- [Creating Elements](https://www.remotion.dev/docs/elements/creating.md) and [Building Element Libraries](https://www.remotion.dev/docs/elements/libraries.md): for publishing Elements
