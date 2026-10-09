---
name: update-codex-plugin
description: Update Remotion's published Codex and ChatGPT directory plugin to a released Remotion version. Prepare the ZIP from the official Codex plugin repository, preserve its listing metadata, and upload and publish through OpenAI Platform.
---

# Update the Codex plugin

Update the existing public Remotion plugin, whose identity is
`plugins~Plugin_efd07789186881918253a50acfc32762`.

- Dashboard: https://platform.openai.com/plugins/manage/plugins~Plugin_efd07789186881918253a50acfc32762
- Public listing: https://chatgpt.com/plugins/plugins~Plugin_efd07789186881918253a50acfc32762
- Release source: https://github.com/remotion-dev/codex-plugin

The monorepo release pipeline updates this GitHub repository but does not update
the public directory. `codex plugin add` and marketplace upgrades manage local
installations, not the public listing. Do not use the old `packages/codex-plugin`
build directory, `openai/plugins`, or the portable `cursor-plugin` package for this
upload.

As checked on 2026-10-08, OpenAI documents a dashboard ZIP upload workflow, and
the available CLI has no public-directory publishing command. Use browser tools
for this part. Prefer a documented publishing API if one becomes available;
do not replay private dashboard requests or extract browser credentials.
Current reference: [OpenAI plugin submission](https://developers.openai.com/plugins/deploy/submission).

## Inspect the current release

Use the browser's signed-in OpenAI Platform session. Confirm the Remotion
organization and the existing plugin identity. The dashboard's **Publication
Version** is authoritative; the local plugin cache can lag behind it.

Read the version selector and review state before uploading. If the requested
version is already published, report that. If its draft or review already exists,
continue that version instead of making a duplicate. Do not cancel another
active review just to upload again.

Select the **Published** version under **Metadata & Skills**, then use **More
plugin actions → Download release ZIP**. Use the actual downloaded file path.
This is the baseline for preserving listing text, branding, and publication
settings. An installed cache is not a substitute for the published package.

## Prepare the ZIP

Run from the monorepo root:

```bash
python3 .agents/skills/update-codex-plugin/scripts/prepare-release.py \
  --published-zip /absolute/path/to/downloaded-release.zip
```

By default, the helper resolves the latest stable Remotion GitHub release. To
use a user-requested release, add `--version 4.0.534`. It requires `gh` and Python
3, fetches the corresponding tag from `remotion-dev/codex-plugin`, pins its commit,
and creates a temporary staging directory and upload ZIP outside the checkout.
It does not publish, install, or modify the monorepo.

The helper uses the released package and preserves the published `interface`,
assigned `id`, and OpenAI `extensions`, including referenced listing assets.
Inspect its JSON report, particularly `preserved_manifest_differences`. Keep
those overrides for a skills update; change them only when the task includes a
listing change. If the source package structure has changed incompatibly, adapt
the helper before uploading instead of silently dropping components.

Check the reported source commit, version, skill names, and ZIP path. With the
monorepo dependencies installed, lint the staged package from
`packages/agent-plugin` using the existing Vally library:

```bash
bun -e 'import {runLint, LintConsoleReporter} from "@microsoft/vally"; const result = await runLint({rootPath: process.argv[1]}); await new LintConsoleReporter({verbose: true}).report(result); if (!result.passed) process.exit(1);' /absolute/path/to/staged/remotion
```

`@microsoft/vally` is a library; it does not provide a `vally` CLI. Fix actual
packaging findings before uploading. Do not change skill content merely to
bypass a safety finding.

## Upload and publish in the browser

An instruction to update this published plugin covers its normal upload and
publication workflow. Honor narrower requests such as preparing a ZIP, creating
a skill, or uploading a draft; those alone do not authorize publication.

1. Open the existing plugin and click **Upload new version**, **Upload plugin to
   make changes**, or **Upload plugin to fix issues**, whichever the dashboard shows.
2. In **Upload new version**, keep the existing verified Remotion developer
   identity. Choose the helper's ZIP using the browser tool's file-upload API,
   reading its upload documentation first. Choosing the file can start the upload
   immediately; inspect the result before clicking **Upload plugin** or retrying.
   If Chrome's extension upload requires **Allow access to file URLs**, the native
   picker also works: select the correct Chrome tab through the native app tool,
   click **Choose file**, press Command-Shift-G, read the new accessibility state,
   set the path field to the exact ZIP, press Return, verify the selected filename,
   then click **Open**. Do not change extension permissions just for this fallback.
3. Confirm the new version under **Metadata & Skills**. Read metadata and skill
   check results for that version, not the older published version. Refresh the
   browser state after actions; do not reuse stale element indices.
4. Follow the displayed review workflow. Read findings before deciding whether
   they block submission. A skill can show **Needs attention** while the version
   is **Approved** and **Ready to publish**; a warning alone does not establish
   that review failed. If a new ZIP is needed, fix the staged package and
   recreate it, preserving the release's provenance. Do not keep uploading the
   same ZIP to retry pending scans.
5. When the requested version is approved and publication is authorized, select
   **Publish plugin**. If policy attestations include accepting legal terms,
   obtain the confirmation required by the active browser tool before accepting
   them. Do not claim unperformed tests or invent review information.
6. Verify **Publication Version** shows the target version as **Published**.
   A selected draft, successful upload, approval, or GitHub tag does not establish
   publication. Save browser evidence using the active tool's supported method.

Scans and human review may outlast the current turn. Report the exact version,
state, findings, and dashboard URL; keep the dashboard available for follow-up.
Only set up a scheduled follow-up when the user asks for one. On an uncertain
upload result, inspect the version list before retrying.

Finish with the prepared or published version, source commit, validation result,
and any remaining dashboard step. Clearly distinguish **prepared**, **uploaded**,
**under review**, **approved**, and **published**.
