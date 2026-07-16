---
name: pr-name
description: Correct naming for a PR
---

The following format must be used for the PR title:

```
`[package-name]`: [commit-message]
```

For example:

```
`@remotion/shapes`: Add heart shape
```

The package name must be obtained from package.json.  
If multiple packages are affected, use the one that you think if most relevant.

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
