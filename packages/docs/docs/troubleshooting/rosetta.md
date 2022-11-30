---
image: /generated/articles-docs-troubleshooting-rosetta.png
id: rosetta
sidebar_label: Apple Silicon detected
title: Apple Silicon under Rosetta
crumb: "Troubleshooting"
---

Running Remotion on Apple Silicon (M1 chip) under Rosetta can be up to 2x slower.

The recommended way to run Remotion on Apple Silicon is using Node 16 with the native arm64 architecture.

If you encounter the following warning while using `@remotion/renderer`:

```
Apple Silicon detected but running under Rosetta (not arm64 architecture). This will cause performance issues.
Recommended actions:
 - Upgrade to Node 16.0.0 or later
 - Run Node using `arch -arm64` architecture
```

You are either using Node 14 (which uses Rosetta on Apple M1 chips), or you are running a node version installed with `arch -x86_64`.

## Solution

1. Upgrade to Node 16 or later
1. Install Node and run it natively

For example, installing node natively using nvm:

```
arch -arm64 zsh
nvm install 16
```

You can check the architecture of your shell by typing in a terminal `arch`.  
You can check the Node architecture by running in a terminal `node -p process.arch`.  
If both of these print out `arm64` you are good to go.
