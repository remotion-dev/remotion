# @remotion/skills-evals

Internal visual evals for Remotion agent skills.

The app is the main way to run and inspect evals. It reads scenario definitions
from `scenarios.ts`, copies the blank Remotion template into an isolated run
folder, copies the repo-local skills into that sandbox, runs `pi`, asks the same
Pi session to render a video artifact, and stores the result under `.runs/`.

## Start the app

```bash
bun run dev
```

This starts the local dashboard at `http://localhost:4321` and opens it in the
browser on macOS.

## Workflow

1. Edit the skills in `packages/skills/skills`.
2. Start the dashboard with `bun run dev`.
3. Open a scenario page.
4. Click **Run comparison**.
5. Review the before/after video artifacts, Pi exports, manifests, logs, and
   skill diff in the app.

Comparisons are scenario-scoped. Each comparison uses the skills from `HEAD` as
the `before` snapshot and the current working tree as the `after` snapshot, so
iteration is always measured against the checked-in baseline.

## CLI

The CLI is still useful for terminal-driven runs:

```bash
bun run eval list
bun run eval compare animated-bar-chart
bun run eval run animated-bar-chart
bun run eval run --all
bun run eval dev
```

`compare` runs the before/after flow and writes data that the dashboard can
render. `run` executes one scenario without a before/after comparison.

## Runs

Run data is written to `.runs/` and includes:

- `manifest.json` for each run.
- Pi session JSONL and exported HTML.
- command stdout/stderr logs, including the separate `pi-render` follow-up.
- discovered visual artifacts, with videos preferred in the dashboard.
- comparison data and `skills.diff` for before/after runs.
