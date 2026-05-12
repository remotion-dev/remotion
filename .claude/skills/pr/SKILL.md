---
name: make-pr
description: Open a pull request for the current feature
---

Ensure we are not on the main branch, make a branch if necessary.  
For all packages affected, run Oxfmt to format the code:

```
bunx oxfmt src --write
```

Commit the changes. The title of the PR must be according to the [`pr-name`](../pr-name/SKILL.md) skill.

Push the changes to the remote branch.  
Use the `gh` CLI to create a pull request and use the same format as above for the title.
