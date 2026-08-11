---
name: pr-name
description: Review or correct a Remotion pull request title
---

When given a pull request, inspect its current title and diff before proposing a
name. Do not infer the prefix from the directory name or from a Conventional
Commit scope such as `fix(core)`. Read the affected package's `package.json` and
use its exact `name` value.

By default, use that package name in the PR title:

```
`[package-name]`: [commit-message]
```

For example:

```
`@remotion/shapes`: Add heart shape
```

If multiple packages are affected, use the one that you think is most relevant.


## Special handling

For changes that match one of the categories below, use its special prefix instead of a package name. Classify the change by its user-facing impact, not merely by the package directory containing the changed files.

If a change only adds, fixes, or stabilizes internal tests, test fixtures, snapshots, or test infrastructure, and does not change shipped behavior, use the `Internal:` prefix. This also applies to package-local tests under a published package. Do not use that package's name as the prefix just because the test is located there. The package name may instead appear in the description when useful:

```
Internal: Stabilize registration range test in `@remotion/transitions`
```

If shipped implementation changes are accompanied by tests, use the normal affected-package prefix instead.

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
