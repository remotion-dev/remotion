---
name: make-pr
description: Open a pull request for the current feature
---

Ensure we are not on the main branch, make a branch if necessary.  
For all packages affected, run Prettier to format the code:

```
bunx prettier --experimental-cli src --write
```

Commit the changes, use the following format:

```
[package-name]: [commit-message]
```

For example, `@remotion/shapes: Add heart shape`.  
The package name must be obtained from package.json.  
If multiple packages are affected, use the one that you think if most relevant.

Push the changes to the remote branch.  
Use the `gh` CLI to create a pull request and use the same format as above for the title.
