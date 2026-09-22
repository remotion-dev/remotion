---
name: release
description: Release a new Remotion version
---

- Kill any `turbo` processes that might be running with SIGKILL
- Before beginning the release, verify that gcloud is logged in by running `gcloud auth print-access-token >/dev/null`. If it fails, run `gcloud auth login`, then repeat the check. Do not continue with the release until the check succeeds.
- Codex-specific: Before running release commands, make sure rbenv wins over the macOS system Ruby. Codex may start non-interactive shells with `/usr/bin` before `~/.rbenv/shims`, causing Ruby 2.6 to be used even though the user's terminal uses Ruby 3.3.x. Run release commands that may invoke Ruby/Bundler with:
  `PATH="$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH" <command>`
  Verify with `PATH="$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH" ruby --version`; it should use the user's rbenv Ruby, not `/usr/bin/ruby`. This matters because the lambda Ruby package currently resolves gems such as `json` that require Ruby >= 2.7.
- Run `npm login` (I will manually do 2FA in the browser)
- Use `op item get "Npmjs" --fields password --reveal --account remotiondev.1password.com` to get the password for NPM.
- Use `op item get "Npmjs" --otp --account remotiondev.1password.com` to get a one-time password for 2FA.
- Run `npm token create --name="PublishRemotionXXXXXX" --packages "remotion" --packages "create-video" --packages-and-scopes-permission read-write --bypass-2fa --scopes "@remotion" --otp=<otp>`. Replace XXXXXX with a random string so we have a unique name. Use `op item get "Npmjs" --otp --account remotiondev.1password.com` to get the OTP and pass it via `--otp=`. It will ask for a password, pipe in the password using `echo "$PASSWORD" |`.
- Run `bun i`
- Run `bun run build`
- Run `npm view remotion version` to get the current version number
- Run `bun set-version.ts <version>`, where <version> is the current version plus 1. If the exit code is not 0, abort the entire release process immediately.
- Run `cd packages/example && sh runlambda.sh && cd ../..`. If this fails, abort the release.
- Run `NPM_CONFIG_TOKEN=<token> bun run release` where <token> is the NPM token we just created
  - Ordinary publishing already triggers [npm's automatic malware scan](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/); no separate staging step is needed for the current direct-publish workflow. Availability commonly takes around five minutes, sometimes 15 minutes or longer. These times are not guarantees.
  - Verify every public package selected by `publish.ts` with `npm view <package>@<version> version --json`. A successful `bun publish --tolerate-republish` exit is not proof of availability: it can hide a `409 Cannot publish over previously staged version "<version>"`.
  - For missing versions or staging conflicts, check the [npm lifecycle status API](https://api-docs.npmjs.com/): `GET https://registry.npmjs.org/-/package/<encoded-package-name>/version/<version>/status`, authenticated with a token that has publish access. URL-encode scoped names, for example `@remotion%2Fwhisper-web`. Keep credentials out of logs.
  - If the status is `validating`, poll status and exact-version availability once per minute for up to 15 minutes while continuing independent release work. Do not republish or restage the same version while scanning is pending. If it is still validating after this observation window, report it as an acceptable pending scan with its last observed status, not as available or guaranteed to become available.
  - If the version is awaiting maintainer approval, use `npm stage list <package> --json` and `npm stage view <stage-id> --json` to verify the package and version. [Wait for scanning to finish before approval](https://github.blog/changelog/2026-09-03-multiple-trusted-publishing-configurations-for-npm/), then run `npm stage approve <stage-id> --otp=<fresh-otp>` using the authenticated maintainer session and the 2FA instructions above. Waiting alone does not approve a staged version. Recheck exact-version availability after approval or a published status.
  - An empty stage list does not prove that scanning is pending or that a conflict will resolve itself. If the status API is unavailable, check `npm stage list` and the package's versions page on npmjs.com while logged in as a maintainer. A status API `403` can mean the endpoint is not enabled for this package; `404` can mean a missing version or insufficient access. Report blocked, rejected, manual-review, or unknown states and unresolved errors explicitly; do not classify them as acceptable scanning delays.
  - If npm explicitly returns `E_STAGE_REQUIRED`, follow [staged publishing](https://docs.npmjs.com/cli/v11/commands/npm-stage/): use `npm stage publish <tarball>` with the affected package's prepared release artifact, wait for scanning, then review and approve its stage as above. A staging 409 alone is not a reason to switch workflows or upload again.
  - In the release summary, distinguish verified available packages, confirmed pending scans, stages awaiting approval, and unresolved failures. Include the affected package and version for every pending or failed item. Other publish failures remain errors.
- Once the new package versions needed by the templates are available, run `bun run publishtemplates` from the repository root to republish every template. If a required version is still pending, report template publishing as pending too. If any template fails to publish, stop the release workflow and report the failure.
- Generate a changelog in markdown and save it to `/tmp/release-<version>.md`:
  - Run `git log v<previous_version>..v<new_version> --oneline` to get all commits
  - Extract PR numbers from merge commits
  - For each PR, run `gh pr view <number> --json title,author,number,url --jq '"* \(.title) by @\(.author.login) in \(.url)"'`
  - Categorize PRs into sections: "What's Changed", "Templates", "Docs", "Internal"
  - In "What's Changed", sort items so that entries for the same package are adjacent (no subheadings, just sorted order). Changes to the `remotion` core package should appear first
  - Strip redundant prefixes from PR titles (e.g. remove "Docs:" from items in the Docs section)
  - Linkify items whose PR added a new documentation page: run `git diff --diff-filter=A --name-only v<previous_version>..v<new_version> -- 'packages/docs/docs/**/*.mdx' 'packages/docs/docs/**/*.md'` to list added docs pages, map each added page to the PR that introduced it, and wrap that item's title in a markdown link to the page (e.g. `* [<title>](https://remotion.dev/docs/<slug>) by @author in <url>`). Determine the URL from the page's `slug:` frontmatter if present, otherwise from its file path relative to `packages/docs/docs/`. Leave items without a new docs page unlinked.
  - "Templates" is a separate section for any template-\* changes
  - Check for genuinely new contributors by running `gh api repos/remotion-dev/remotion/contributors --paginate --jq '.[].login'` and comparing against PR authors. Only add a "New Contributors" section for authors not in that list
  - Add `**Full Changelog**: https://github.com/remotion-dev/remotion/compare/v<previous_version>...v<new_version>` at the bottom
  - Use the same format as previous GitHub releases (check with `gh release view v<previous_version>`)
  - Don't release until you get approval. Allow me to edit it before.
