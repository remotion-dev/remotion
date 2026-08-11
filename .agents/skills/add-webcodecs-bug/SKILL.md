---
name: add-webcodecs-bug
description: Add a browser WebCodecs bug to the Remotion Mediabunny WebCodecs bugs docs page. Use when given a Chromium, WebKit, or Firefox issue URL that should be tracked in packages/docs/docs/mediabunny/webcodecs-bugs.mdx, especially when needing to look up the issue title, filing date, reporter, and resolution state before editing the MDX table.
---

# Add WebCodecs Bug

## Workflow

1. Read `packages/docs/docs/mediabunny/webcodecs-bugs.mdx` to understand the current table format.
2. Open the provided issue URL with the `browser:control-in-app-browser` skill.
3. On the issue page, verify:
   - issue title
   - created or filed date
   - reporter or filed-by identity
   - current status and resolution state
4. Map the browser tracker to the table fields:
   - Product: Chromium issues are `Chrome`, WebKit Bugzilla issues are `Safari`, Mozilla Bugzilla issues are `Firefox`.
   - Filed by: use the known handle from the task when the tracker only exposes a redacted email. Known reporter mappings:
     - `musica-viva.de` or `dp@...@musica-viva.de` → `@Vanilagy`
   - Fixed?: use `Yes` only for fixed or verified-fixed issues, `No` for open/new/assigned/unresolved issues, and `Won't fix` for explicitly rejected or wontfix resolutions.
5. Add one Markdown table row to `packages/docs/docs/mediabunny/webcodecs-bugs.mdx`.

Preserve the existing table columns and wording. Do not add a date column unless the docs file already has one or the user explicitly asks for it.

## Verification

After editing, inspect the diff and confirm the row has the right URL, product, filed-by value, and fixed state.
