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

If the change adds or modifies a skill, or is otherwise internal monorepo work, use the `remotion-monorepo` prefix:

```
`remotion-monorepo`: Add PR naming skill
```

If the change relates to Remotion Elements, use the `Elements:` prefix:

```
Elements: Add animated title element
```
