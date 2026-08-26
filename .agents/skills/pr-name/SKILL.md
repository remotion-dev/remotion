---
name: pr-name
description: Review or correct a Remotion pull request title
---

When given a pull request, inspect its current title and diff before proposing a
name. Treat the title as a changelog entry for developers, not as a
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

For example:

```
`@remotion/shapes`: Add heart shape
```

If multiple packages are affected, use the package that owns the primary
user-facing change, not necessarily the package with the most changed files.

## Describe the change

Use these guidelines in order:

1. Identify the main developer-visible change from the diff.
2. If a public API is central to the change, name the primary API exactly in
   backticks and briefly explain what it does. Do not list supporting APIs.
3. Otherwise, describe what changed rather than the files or implementation
   steps used to achieve it. Include technical details only when they help
   developers understand the result.

Prefer concrete verbs such as `add`, `fix`, `remove`, `rename`, and `change`.
Avoid vague descriptions such as `allow`, `improve`, `update handling`, or
`support` when the diff provides a clearer description. PR titles may use
concise, telegraphic wording. Do not add articles or filler solely to make the
title a grammatically complete sentence; keep them when they improve clarity.

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
`@remotion/studio`: Remove Asset Inspector quick action scrollbar
```

The first example is better than "Add Element catalogs to Studio" because it
names the main API and explains its purpose. The Studio CSS example deliberately
describes the visible result instead of the CSS file or overflow rule that
implemented it.

## Special handling

For changes that match one of the categories below, use its special prefix
instead of a package name. Classify the change by its user-facing impact, not
merely by the package directory containing the changed files.

If a change only adds, fixes, or stabilizes internal tests, test fixtures,
snapshots, or test infrastructure, and does not change shipped behavior, use the
`Internal:` prefix. This also applies to package-local tests under a published
package. Do not use that package's name as the prefix just because the test is
located there. The package name may instead appear in the description when
useful:

```
Internal: Stabilize registration range test in `@remotion/transitions`
```

If shipped implementation changes are accompanied by tests, use the normal
affected-package prefix instead.

If the change is about docs only:

```
Docs: Add page about heart shape
```

If the change is internal monorepo work that does not have a more specific
category below, use the `Internal:` prefix:

```
Internal: Simplify release bookkeeping
```

If the change relates to Remotion Elements, use the `Elements:` prefix:

```
Elements: Add animated title element
```

If the change relates to packages/convert, use the remotion.dev/convert prefix:

```
remotion.dev/convert: Support trimming
```

If the change relates to packages/example, say Internal Testbed:

```
Internal testbed: Add trimming sample composition
```

If the change adds or modifies a skill, prefix with `Skills:`:

```
Skills: Add `/remotion-upgrade` skill
```

If the change relates to packages/brand, prefix with remotion.dev/brand:

```
remotion.dev/brand: Add animated logo
```

If the change relates to packages/it-tests, prefix with Internal tests:

```
Internal tests: Add video integration test
```
