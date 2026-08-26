---
name: pr-name
description: Review or correct a Remotion pull request title
---

When given a pull request, inspect its current title and final diff before
proposing a name. Treat the title as a changelog entry for developers, not as a
high-level summary of the work and not as an inventory of everything that
changed. Do not automatically reuse the commit message.

Choose the narrowest title that still explains the developer-facing change. Aim
for the right abstraction level rather than maximum specificity: use one
concrete anchor and one clear outcome.

## Choose the prefix

Do not infer the prefix from the directory name or from a Conventional Commit
scope such as `fix(core)`. For a package change, read the affected package's
`package.json` and use its exact `name` value.

By default, use that package name in the PR title:

```
`[package-name]`: [description]
```

Start the description with a capitalized word, as in:

```
`@remotion/shapes`: Add a heart shape
```

If multiple packages are affected, use the package that owns the primary
user-facing change, not necessarily the package with the most changed files.

## Describe the change

Use these guidelines in order:

1. Identify the main developer-visible change from the diff. Inspect public
   exports, types, documentation, and tests when needed to understand it.
2. If a new or changed public API is central to the change, name the primary
   function, method, component, hook, prop, option, or CLI flag exactly and put
   the identifier in backticks.
3. Briefly explain what that API enables or what outcome changed. Naming an API
   without explaining its purpose is often too abstract for a changelog.
4. Do not enumerate every affected API. If several APIs implement one
   capability, describe the shared capability and name only the primary anchor,
   if there is one.
5. For UI, CSS, or implementation fixes, describe the observable result. Do not
   name files, selectors, CSS properties, internal helpers, or implementation
   layers unless they are themselves the developer-facing subject of the
   change.
6. Include a technical mechanism or type only when it is part of the public
   contract or materially helps developers understand the change.

Prefer concrete verbs such as `add`, `fix`, `remove`, `rename`, and `change`.
Avoid vague descriptions such as `allow`, `improve`, `update handling`, or
`support` when the diff provides a clearer description.

Useful title shapes include:

```
`[package]`: Add `[api]()` for [concise purpose]
`[package]`: Add a `[name]` option to `[api]()` for [concise purpose]
`[package]`: Fix [observable problem] when [condition]
`[package]`: Change `[api]()` to [new observable behavior]
```

Examples:

```
`@remotion/studio-protocol`: Add `addElementLibraryToStudio()` for adding Element libraries to the config
`@remotion/web-renderer`: Add a `metadata` option to `renderMediaOnWeb()` using Mediabunny's `MetadataTags`
`@remotion/studio`: Remove the scrollbar from Asset Inspector quick actions
```

The first example is better than "Add Element catalogs to Studio" because it
names the main API and explains its purpose. The Studio CSS example deliberately
describes the visible result instead of the CSS file or overflow rule that
implemented it.

## Special handling

For changes that match one of the categories below, use its special prefix
instead of a package name. Classify the change by its primary user-facing impact,
not merely by the package directory containing the changed files. A shipped
package API change keeps the package prefix when docs and tests accompany it.

If a change only adds, fixes, or stabilizes internal tests, test fixtures,
snapshots, or test infrastructure, and does not change shipped behavior, use the
`Internal:` prefix. This also applies to package-local tests under a published
package. Do not use that package's name as the prefix just because the test is
located there. The package name may instead appear in the description when
useful:

```
Internal: Stabilize the registration range test in `@remotion/transitions`
```

If shipped implementation changes are accompanied by tests, use the normal
affected-package prefix instead.

If the change is about docs only:

```
Docs: Add a page about the heart shape
```

If the change is internal monorepo work that does not have a more specific
category below, use the `Internal:` prefix:

```
Internal: Simplify release bookkeeping
```

If the primary deliverable adds or modifies a Remotion Element or Elements
catalog content, use the `Elements:` prefix. Do not use this prefix merely
because a package API interacts with Elements; use that package's name instead.

```
Elements: Add an animated title element
```

If the change relates to packages/convert, use the remotion.dev/convert prefix:

```
remotion.dev/convert: Support trimming
```

If the change relates to packages/example, say Internal testbed:

```
Internal testbed: Add a trimming sample composition
```

If the change adds or modifies a skill, prefix with `Skills:`:

```
Skills: Add the `/remotion-upgrade` skill
```

If the change relates to packages/brand, prefix with remotion.dev/brand:

```
remotion.dev/brand: Add an animated logo
```

If the change relates to packages/it-tests, prefix with Internal tests:

```
Internal tests: Add a video integration test
```

## Final check

Before proposing the title, verify:

- It is understandable without the PR body.
- It describes the main developer-visible outcome rather than the broad project
  goal.
- It names the primary public API when that API is central, but does not list
  every API or implementation detail.
- Its prefix reflects the owner of the user-facing change.
- The description after the prefix starts with a capitalized word unless it
  must begin with an identifier whose casing differs.
- Every technical claim is supported by the diff.
