# @remotion/skills-evals

## Usage

This is an internal package for running and reviewing Remotion skills evals.

```bash
bun run eval list
bun run eval run <scenario-id>
bun run eval compare <scenario-id>
bun run eval dev
```

The dev server shows completed runs and comparisons from `.runs`.

## Sharing results

From the dev server, use the `Share` button on a run or comparison page to
build a static share bundle. On a scenario page, select multiple completed
results and use `Share selected`.

The share action writes a static site under `.site` and prints a command the
user can run manually for a one-time Vercel deployment:

```bash
vercel deploy <output-directory>
```

You can also export from the CLI:

```bash
bun run eval export .runs/<scenario-id>/<run-id>/manifest.json
bun run eval export .runs/comparisons/<scenario-id>/<comparison-id>/comparison.json
bun run eval export <path-a> <path-b> --out /tmp/skills-evals-share
```

The exported folder contains `index.html`, `metadata.json`, and a `files/`
directory with the referenced videos, images, Pi exports, manifests, diffs, and
logs.
