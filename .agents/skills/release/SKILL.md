---
name: release
description: Release a new Remotion version
---

- Kill any `turbo` processes that might be running with SIGKILL
- Before beginning the release, verify that gcloud is logged in by running `gcloud auth print-access-token >/dev/null`. If it fails, run `gcloud auth login`, then repeat the check. Do not continue with the release until the check succeeds.
- Codex-specific: Before running release commands, make sure rbenv wins over the macOS system Ruby. Codex may start non-interactive shells with `/usr/bin` before `~/.rbenv/shims`, causing Ruby 2.6 to be used even though the user's terminal uses Ruby 3.3.x. Run release commands that may invoke Ruby/Bundler with:
  `PATH="$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH" <command>`
  Verify with `PATH="$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH" ruby --version`; it should use the user's rbenv Ruby, not `/usr/bin/ruby`. This matters because the lambda Ruby package currently resolves gems such as `json` that require Ruby >= 2.7.
- Check `npm whoami`. Only if it fails, run `npm login` (I will manually do 2FA in the browser)
- Use `op item get "Npmjs" --fields password --reveal --account remotiondev.1password.com` to get the password for NPM.
- Use `op item get "Npmjs" --otp --account remotiondev.1password.com` to get a one-time password for 2FA.
- Run `npm token create --name="PublishRemotionXXXXXX" --packages "remotion" --packages "create-video" --packages-and-scopes-permission read-write --bypass-2fa --scopes "@remotion" --otp=<otp>`. Replace XXXXXX with a random string so we have a unique name. Use `op item get "Npmjs" --otp --account remotiondev.1password.com` to get the OTP and pass it via `--otp=`. It will ask for a password, pipe in the password using `echo "$PASSWORD" |`.
  - Do **not** pass `--json`: npm masks the token as `npm_***` in JSON output, making it unusable. Redirect the plain output to a file in the scratchpad and extract the token with `grep -oE 'npm_[A-Za-z0-9]{20,}'` into a scratchpad file (e.g. `$SP/npm_token`). Never print the token. If a token turned out unusable, revoke it with `npm token revoke <id> --otp=<otp>` (find the id with `npm token list`).
- Run `bun i`
- Run `bun run build`
- Run `npm view remotion version` to get the current version number
- Run `bun set-version.ts <version>`, where <version> is the current version plus 1. If the exit code is not 0, abort the entire release process immediately. Do not pipe its output (e.g. into `tail`): the shell is zsh, so `$PIPESTATUS` is unavailable and the exit code gets lost. Redirect to a log file instead, then confirm the `v<version>` commit and tag exist.
- Run `cd packages/example && sh runlambda.sh && cd ../..`. If this fails, abort the release.
- Publish the public packages under a temporary npm dist-tag, then promote `latest` only after **every** package is installable. `validating` is [npm's automatic scan for ordinary publishes](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/), not a reason to use `npm stage`. Do not run `bun run release`: its current script publishes directly to `latest` and starts private publishing and Git pushes before the availability gate.
  - From the repository root, after `set-version.ts`, run:

    ```bash
    releaseVersion=$(node -p "require('./packages/core/package.json').version")
    releaseTag="remotion-release-$(printf '%s' "$releaseVersion" | tr . -)"
    releaseManifest="/tmp/remotion-release-${releaseVersion}-packages.txt"
    bun publish.ts --list > "$releaseManifest"
    ```

    The manifest is the exact package list to check and promote. Record each package's previous `latest` tag so a partial promotion can be rolled back.

  - Check whether any package in the manifest is being published to npm for the first time. [Bun adds `latest` to a package's initial publish even with `--tag`](https://bun.com/docs/pm/cli/publish/). If there are new packages, stop before the bulk publish and plan their first publication separately; this flow cannot keep their first version off `latest`.
  - Run `NPM_CONFIG_TOKEN=<token> bun publish.ts --tag="$releaseTag"` with the token created above. Bun still packs the packages and rewrites `workspace:` and `catalog:` dependencies. This tagged path does not tolerate republish errors. A successful upload is not proof that npm's scan is finished: check the manifest, exact package versions, and temporary tags. Do not upload the same version again while its scan is pending. If a publish attempt failed and the version is confirmed absent, resume that package alone with `bun publish.ts --tag="$releaseTag" --only=<package>` using the same token; never rerun the entire manifest blindly.
  - For each package in the manifest, require `npm view <package>@<version> version --json` **and** a successful `npm pack <package>@<version> --pack-destination <temporary-directory>` before promotion. The pack check confirms the tarball can actually be fetched. Run the per-package checks with a `while read -r p; do ( ... ) & done < "$releaseManifest"; wait` loop (not `xargs -I`, which fails with "command line cannot be assembled"). Right after publishing, expect roughly a third of the packages to still be `validating`; this has taken ~15 minutes. Write the polling loop as a script and run it in the background, and draft the changelog meanwhile. Poll unresolved packages about once per minute; use the [npm lifecycle status API](https://api-docs.npmjs.com/) where available: `GET https://registry.npmjs.org/-/package/<encoded-package-name>/version/<version>/status`, authenticated with publish access. URL-encode scoped names, such as `@remotion%2Fwhisper-web`, and keep credentials out of logs. If a package remains `validating` after an hour, report the release as pending and leave every `latest` tag on the prior release. Blocked, rejected, manual-review, missing, and unknown states also stop promotion; investigate them rather than treating them as scanning delays.
  - Once **all** packages are installable, use the release token to run `npm dist-tag add <package>@<version> latest` for every package in the manifest. The npm CLI ignores `NPM_CONFIG_TOKEN` (only `bun publish` respects it) and falls back to the login session, failing with `EOTP`. Pass the token like this instead: `env "npm_config_//registry.npmjs.org/:_authToken=$TOKEN" npm dist-tag add ...`. This is one registry operation per package; npm has no atomic multi-package promotion. Verify that `npm view <package> dist-tags.latest --prefer-online` equals the release version for every package. Parallel checks can return stale cached tags for a few packages; recheck mismatches sequentially before treating them as failures. If promotion fails partway, restore the recorded previous `latest` tags for packages already changed and report the incomplete release. After a successful promotion, remove the temporary tag from each package and verify the final tags. The release token gets `E403` on `dist-tag rm`, so use the logged-in session with a fresh OTP per call: `npm dist-tag rm <package> <releaseTag> --otp=$(op item get "Npmjs" --otp --account remotiondev.1password.com)`. If a call fails because the OTP rolled over, wait 30 seconds and retry once.
  - If npm explicitly returns `E_STAGE_REQUIRED`, direct publishing is unavailable for that package. Stop this release and assess a staged workflow separately; [staged approval requires a 2FA action per package](https://docs.npmjs.com/cli/v11/commands/npm-stage/). Do not silently mix a staged package into this direct-publish flow.

- Only after all public `latest` tags are verified, run `bunx turbo run publishprivate --concurrency=1`, then `git push --tags` and `git push` from the repository root. If any step fails, stop and report the affected release state.
- Run `bun run publishtemplates` from the repository root to republish every template after the public packages have been promoted. If any template fails to publish, stop the release workflow and report the failure.
- Generate a changelog in markdown and save it to `/tmp/release-<version>.md`:
  - Run `git log v<previous_version>..v<new_version> --oneline` to get all commits
  - Extract PR numbers from merge commits
  - For each PR, run `gh pr view <number> --json title,author,number,url --jq '"* \(.title) by @\(.author.login) in \(.url)"'`
  - Categorize PRs into sections: "What's Changed", "Templates", "Docs", "Internal"
  - Also use the "Elements" and "Internal and Experimental" sections when previous releases do
  - In "What's Changed", put headline features (especially ones with new docs pages) first, then sort items so that entries for the same package are adjacent (no subheadings, just sorted order). Changes to the `remotion` core package should appear first
  - Strip redundant prefixes from PR titles (e.g. remove "Docs:" from items in the Docs section)
  - Linkify items whose PR added a new documentation page: run `git diff --diff-filter=A --name-only v<previous_version>..v<new_version> -- 'packages/docs/docs/**/*.mdx' 'packages/docs/docs/**/*.md'` to list added docs pages, map each added page to the PR that introduced it, and wrap that item's title in a markdown link to the page (e.g. `* [<title>](https://remotion.dev/docs/<slug>) by @author in <url>`). Determine the URL from the page's `slug:` frontmatter if present, otherwise from its file path relative to `packages/docs/docs/`. Leave items without a new docs page unlinked.
  - "Templates" is a separate section for any template-\* changes
  - Check for genuinely new contributors by running `gh api repos/remotion-dev/remotion/contributors --paginate --jq '.[].login'` and comparing against PR authors. Only add a "New Contributors" section for authors not in that list
  - Add `**Full Changelog**: https://github.com/remotion-dev/remotion/compare/v<previous_version>...v<new_version>` at the bottom
  - Use the same format as previous GitHub releases (check with `gh release view v<previous_version>`)
  - Don't release until you get approval. Allow me to edit it before. This does not block the npm steps: draft the changelog while npm scans packages, and continue with promotion, private publishing, pushes and templates without waiting.
  - After approval, re-read `/tmp/release-<version>.md` (I may have edited it) and run `gh release create v<version> --title v<version> --notes-file /tmp/release-<version>.md --verify-tag`.
- Finally, delete the local copies of the npm token from the scratchpad. It expires by itself after 7 days.
