---
name: remotion-upgrade
description: Upgrade Remotion, and related packages
version: 4.0.520
---

# Upgrade Remotion

1. Inspect the project manifests and lockfile to identify the package manager and workspaces. Preserve unrelated changes.
2. Determine whether `@remotion/cli` is locally available. If it is, run:

   ```bash
   npx remotion upgrade
   ```

   This also updates project-local Remotion skills. Skip the manual upgrade below.

3. If `@remotion/cli` is not available, upgrade manually:
   - Get the latest stable Remotion version with `npm view remotion version`.
   - Find every installed `remotion` and `@remotion/*` dependency across the project and upgrade them all to that exact version. Preserve their dependency sections and the project's workspace or catalog conventions.
   - Read the current [Mediabunny compatibility page](https://www.remotion.dev/docs/mediabunny/version) and determine the Mediabunny version compatible with the target Remotion version. Upgrade every installed `mediabunny` and `@mediabunny/*` package to the documented compatible version.
   - Run the project's package manager to update its lockfile.
4. If `@remotion/cli` is not available, update the installed Remotion skills:

   ```bash
   npx skills update remotion-best-practices remotion-captions remotion-create remotion-docs remotion-interactivity remotion-maps remotion-markup remotion-multimedia remotion-render remotion-saas remotion-studio remotion-upgrade --yes
   ```

5. Review the manifest and lockfile diff. Ensure all Remotion packages use one version and all installed Mediabunny packages use the compatible version. If the CLI is available, run `npx remotion versions` as an additional check.

The [Remotion releases](https://github.com/remotion-dev/remotion/releases) contain the changelog and may be useful for summarizing relevant changes after the upgrade.
