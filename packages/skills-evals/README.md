# @remotion/skills-evals

## Usage

This is an internal package.

Run a scenario once:

```bash
bun run eval run <scenario-id>
```

Run a scenario or comparison multiple times in parallel:

```bash
bun run eval run <scenario-id> --runs 4
bun run eval compare <scenario-id> --runs 4
```

`--runs` accepts values from 1 to 4.
