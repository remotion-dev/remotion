---
name: deprecate-api
description: Deprecate a public Remotion API consistently in its TypeScript source and documentation. Use when marking a function, component, hook, type, prop, option, or other public API as deprecated while keeping it available.
---

# Deprecate a Remotion API

Apply all three changes below when deprecating a public API that remains available.

## TypeScript API

Add a JSDoc `@deprecated` annotation to the public symbol. State the replacement when one exists and link to its documentation when useful.

```ts
/**
 * @deprecated Use `newApi()` instead: https://www.remotion.dev/docs/new-api
 */
export const oldApi = () => {};
```

Place the annotation where consumers receive it. For a re-export or compatibility alias, annotate the exported symbol rather than the non-deprecated implementation.

## Documentation heading

Strikethrough the deprecated API name in its heading with double tildes. Keep `<AvailableFrom>` outside the strikethrough.

```mdx
# ~~oldApi()~~<AvailableFrom v="4.0.0" />
```

For a prop or option:

```mdx
### ~~`oldOption?`~~
```

Keep the frontmatter `title` unchanged. Add an explicit heading if the page currently relies only on its frontmatter title.

## Documentation admonition

Place an info admonition directly after the deprecated heading. Name it `Deprecated` and point to the replacement when one exists.

```mdx
:::info Deprecated
Use [`newApi()`](/docs/new-api) instead.
:::
```

## Scope

Do not infer or standardize runtime warnings, sidebar badges, release notes, removal versions, or removal behavior. Change those only when the task explicitly requires them.

Do not apply this skill to an API that has already been removed. Removed APIs may remain documented for migration purposes, but they no longer have a public symbol to annotate.
