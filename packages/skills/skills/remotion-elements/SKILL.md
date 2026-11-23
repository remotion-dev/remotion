---
name: remotion-elements
description: Installs Elements, reusable video components such as titles, backgrounds, charts and caption styles, into a Remotion project with `npx remotion elements use`. Registers Element libraries in Remotion Studio with `npx remotion elements add-library`. Use when given an Element page URL or an Element library URL, or when a video needs a ready-made component.
version: 4.0.546
---

# Elements

An Element is a reusable video component written in React.
Element libraries publish each Element on its own page, the Element page.
Installing an Element copies its source code into the project. The user owns that copy and can edit it and combine it with other Elements like any other component.

If no Remotion project exists yet, load [Create a new Remotion video](../remotion-create/SKILL.md) first.

## Element libraries

Any website can be an Element library, and all Element libraries are peers.
Fetch https://www.remotion.dev/elements/libraries.md for the current list of Element libraries, with each library URL and Markdown index.
The CLI needs an Element page URL. To find one in an Element library that is not listed, fetch its Markdown index, usually at `/llms.txt` on its domain or by appending `.md` to a page.

## Install an Element library

Installing an Element library lists it in Browse Elements in Remotion Studio, where the user can preview its Elements and drag them into a composition.
Before adding an Element from an Element library, install the library. Run exactly:

```bash
npx remotion elements add-library <library-url>
```

- Use the library URL from the list of Element libraries, or the URL the user gave.
- The command adds a `Config.addElementLibrary()` call to `remotion.config.ts`. If the library is already in the config, it changes nothing.
- It reads the display name from the library's page. Pass `--display-name <name>` to override it.
- **`No Remotion config file found`:** create `remotion.config.ts` with `import {Config} from '@remotion/cli/config';` and run the command again.
- Requires Remotion 4.0.547 or later. On older versions, add the `Config.addElementLibrary({url: '<library-url>'})` call to `remotion.config.ts` yourself.

## Add an Element

Copy this checklist and track progress:

```
- [ ] 1. Get the Element page URL and install its Element library
- [ ] 2. Dry run succeeds
- [ ] 3. Element installed
- [ ] 4. Element adapted and previewed
```

### 1. Get the Element page URL and install its Element library

- **Given an Element page URL:** use it.
- **Given an Element library URL or a name:** fetch the library's Markdown index, pick the Element the user asked for, and use its Element page URL.
- **Not given anything:** search the Markdown indexes of the Element libraries for an Element that fits the video.

Markdown indexes link to Markdown documents, which the installer cannot use.
Fetch the Element's Markdown document and use the Element page URL it names near the top, for example after `Element page:` or `URL:`.
If it names none, remove `.md` from the document's URL.

If the Element comes from a known Element library, [install the library](#install-an-element-library). Given only an Element page URL, skip this.

### 2. Dry run

Run exactly:

```bash
npx remotion elements use <element-page-url> --composition <composition-id> --dry-run
```

Read the output and fix the cause before continuing:

- **`No Element found`:** search the page's HTML for `application/vnd.remotion.element+json`. If a `<link>` with that type has an `href`, resolve the `href` against the Element page URL and dry run that JSON URL instead. If there is no payload, the component is not an Element. Follow the install instructions on its Markdown page, for example a `shadcn` command, and skip to step 4.
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
