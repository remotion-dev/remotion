---
name: writing-docs
description: Guides for writing and editing Remotion documentation. Use when adding docs pages, editing MDX files in packages/docs, or writing documentation content.
---

# Writing Remotion Documentation

Documentation lives in `packages/docs/docs` as `.mdx` files.

## Adding a new page

1. Create a new `.mdx` file in `packages/docs/docs`
2. Add the document to `packages/docs/sidebars.ts`
3. Write the content following guidelines below
4. Run `bun render-cards.ts` in `packages/docs` to generate social preview cards

**Breadcrumb (`crumb`)**: If a documentation page belongs to a package, add `crumb: '@remotion/package-name'` to the frontmatter. This displays the package name as a breadcrumb above the title.

```md
---
image: /generated/articles-docs-my-package-my-api.png
title: '<MyComponent>'
crumb: '@remotion/my-package'
---
```

**One API per page**: Each function or API should have its own dedicated documentation page. Do not combine multiple APIs (e.g., `getEncodableVideoCodecs()` and `getEncodableAudioCodecs()`) on a single page.

**Public API only**: Documentation is for public APIs only. Do not mention, reference, or compare against internal/private APIs or implementation details.

**API names in prose**: Put API names in backticks, and link them if a docs page exists. Function and hook names should include `()`, for example [`useVideoConfig()`](/docs/use-video-config), not `useVideoConfig` or useVideoConfig. Components should include angle brackets, for example [`<Player>`](/docs/player/player) or [`<Audio>`](/docs/media/audio).

**Use headings for all fields**: When documenting API options or return values, each property should be its own heading. Use `###` for top-level properties and `####` for nested properties within an options object. Do not use bullet points for individual fields.

**Version indicators**: If an API, feature, parameter, or behavior was added in a specific version, add `<AvailableFrom>` at the page, section, or field where the reader first needs to know it. For example: `# prefetch()<AvailableFrom v="4.0.0" />`.

**Compatibility tables**: API pages should ideally include a `## Compatibility` section with `<CompatibilityTable>` before `## See also`.

## Language guidelines

- **Keep it brief**: Developers don't like to read. Extra words cause information loss.
- **Link to terminology**: Use [terminology](/docs/terminology) page for Remotion-specific terms.
- **Avoid emotions**: Remove filler like "Great! Let's move on..." - it adds no information.
- **Separate into paragraphs**: Break up long sections.
- **Address as "you"**: Not "we".
- **Don't blame the user**: Say "The input is invalid" not "You provided wrong input".
- **Don't assume it's easy**: Avoid "simply" and "just" - beginners may struggle.

## Code snippets

Basic syntax highlighting:

````md
```ts
const x = 1;
```
````

### Type-safe snippets (preferred)

Use `twoslash` to check snippets against TypeScript:

````md
```ts twoslash
import {useCurrentFrame} from 'remotion';
const frame = useCurrentFrame();
```
````

### Hiding imports

Use `// ---cut---` to hide setup code - only content below is displayed:

````md
```ts twoslash
import {useCurrentFrame} from 'remotion';
// ---cut---
const frame = useCurrentFrame();
```
````

### Adding titles

Always add a `title` to code fences that show example usage:

````md
```ts twoslash title="MyComponent.tsx"
console.log('Hello');
```
````

## Special components

### Steps

Formatting around `<Step>` is delicate. Keep one step per line, add a space after `</Step>`, and preserve an explicit line break (`<br/>` or `<br />`) when the steps are written as a compact inline list. Do not write `<Step>1</Step>Add...` without a space.

```md
- <Step>1</Step> First step
- <Step>2</Step> Second step
```

### Experimental badge

```md
<ExperimentalBadge>
<p>This feature is experimental.</p>
</ExperimentalBadge>
```

### Interactive demos

```md
<Demo type="rect"/>
```

Demos must be implemented in `packages/docs/components/demos/index.tsx`. See the `docs-demo` skill for details on adding new demos.

### AvailableFrom

Use to indicate when a feature or parameter was added. No import needed - it's globally available.

**For page-level version indicators**, use an `# h1` heading with `<AvailableFrom>` inline so it appears next to the title (not below it). Use `&lt;` and `&gt;` to escape angle brackets in component names:

```md
# &lt;MyComponent&gt;<AvailableFrom v="4.0.123" />
```

```md
# @remotion/my-package<AvailableFrom v="4.0.123" />
```

For section headings:

```md
## Saving to another cloud<AvailableFrom v="3.2.23" />
```

### CompatibilityTable

Use to indicate which runtimes and environments a component or API supports. No import needed. Place it in a `## Compatibility` section before `## See also`.

Available boolean props: `chrome`, `firefox`, `safari`, `player`, `studio`, `clientSideRendering`, `serverSideRendering`. Set to `true` (supported) or `{false}` (not supported).

Set to empty string `""` for not applicable if this is a frontend API: `nodejs=""`, `bun=""`, `serverlessFunctions=""`.
Use `hideServers` to hide the Node.js/Bun/serverless row if this is a frontend API.

```md
## Compatibility

<CompatibilityTable chrome firefox safari nodejs="" bun="" serverlessFunctions="" clientSideRendering={false} serverSideRendering player studio hideServers />
```

### Optional parameters

For optional parameters in API documentation:

1. **Add `?` to the heading** - this indicates the parameter is optional
   --> Don't do it if it is a CLI flag (beginning with `--`) - CLI flags are always optional
2. **Do NOT add `_optional_` text** - the `?` suffix is sufficient
3. **Include default value in description** - mention it naturally in the text

```md
### onError?

Called when an error occurs. Default: errors are thrown.
```

**Do NOT do this:**

```md
### onError?

_optional_

Called when an error occurs.
```

### Combining optional and AvailableFrom

When a parameter is both optional and was added in a specific version:

```md
### onError?<AvailableFrom v="4.0.50" />

Called when an error occurs.
```

### "Optional since" pattern

If a parameter became optional in a specific version (was previously required):

```md
### codec?

Optional since <AvailableFrom v="5.0.0" inline />. Previously required.
```

## Generating preview cards

After adding or editing a page, generate social media preview cards:

```bash
cd packages/docs && bun render-cards.ts
```

## Streamlining existing docs

When asked to audit or streamline docs, scan for:

- Missing `<AvailableFrom>` indicators for APIs, features, options, parameters, or behaviors introduced in a specific version
- API names that are not formatted as code spans or linked to their docs page
- Function and hook references missing `()`
- API pages that should have a `## Compatibility` section with `<CompatibilityTable>`
- Fragile or broken `<Step>` formatting
