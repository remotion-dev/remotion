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

**One API per page**: Each function or API should have its own dedicated documentation page. Do not combine multiple APIs (e.g., `getEncodableVideoCodecs()` and `getEncodableAudioCodecs()`) on a single page. This is the established pattern throughout the codebase.

**Public API only**: Documentation is for public APIs only. Do not mention, reference, or compare against internal/private APIs or implementation details. Users should only see what is exported and intended for public use.

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

````md
```ts twoslash title="MyComponent.tsx"
console.log('Hello');
```
````

## Special components

### Steps

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

Demos must be implemented in `packages/docs/components/demos/index.tsx`.

## Generating preview cards

After adding or editing a page, generate social media preview cards:

```bash
cd packages/docs && bun render-cards.ts
```

## Verifying docs compile

To check that documentation builds without errors:

```bash
# from the monorepo root
bun run build-docs
```

This validates MDX syntax, twoslash snippets, and broken links.
