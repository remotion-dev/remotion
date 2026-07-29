---
name: deprecate-api
description: Reference for how deprecation of public Remotion APIs is represented in TypeScript source and documentation. Use when adding, reviewing, or discussing a deprecation of a function, component, hook, type, prop, option, or other public API that remains available.
---

# API deprecations in Remotion

Deprecation of a public API that remains available is represented in three places:

1. A JSDoc `@deprecated` annotation on the public TypeScript API.
2. Strikethrough formatting on the API's documentation heading.
3. An `info` admonition named `Deprecated` directly after that heading.

These conventions apply to functions, components, hooks, types, props, options, and other public APIs.

## TypeScript representation

The public symbol carries a JSDoc `@deprecated` annotation. The annotation states the replacement when one exists and may link to its documentation.

```ts
/**
 * @deprecated Use `newApi()` instead: https://www.remotion.dev/docs/new-api
 */
export const oldApi = () => {};
```

The annotation belongs where consumers receive it. For a re-export or compatibility alias, this is the exported symbol rather than the non-deprecated implementation.

## Documentation representation

The deprecated API name in its heading uses double-tilde strikethrough. `<AvailableFrom>` remains outside the strikethrough.

```mdx
# ~~oldApi()~~<AvailableFrom v="4.0.0" />
```

For a prop or option:

```mdx
### ~~`oldOption?`~~
```

The frontmatter `title` remains unchanged. A page that otherwise relies only on its frontmatter title has an explicit struck-through heading.

An info admonition named `Deprecated` appears directly after the heading and points to the replacement when one exists.

```mdx
:::info Deprecated
Use [`newApi()`](/docs/new-api) instead.
:::
```

## Scope

Runtime warnings, sidebar badges, release notes, removal versions, and removal behavior are not currently standardized as part of API deprecation.

Removed APIs are outside this convention. They may remain documented for migration purposes, but they no longer have a public symbol to annotate.
