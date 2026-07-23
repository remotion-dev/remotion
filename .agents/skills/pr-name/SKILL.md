---
name: pr-name
description: Correct naming for a PR
---

By default, use the affected package name from its `package.json` in the PR title:

```
`[package-name]`: [commit-message]
```

For example:

```
`@remotion/shapes`: Add heart shape
```

If multiple packages are affected, use the one that you think is most relevant.

## Special handling

For changes that match one of the categories below, use its special prefix instead of a package name.

If the change is about docs only:

```
Docs: Add page about heart shape
```

If the change adds or modifies a skill, or is otherwise internal monorepo work, use the Internal prefix:

```
Internal: Add PR naming skill
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

If the change relates to Skills, prefix with Skills:

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
