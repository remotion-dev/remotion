---
name: release
description: Release a new Remotion version
---

- Kill any `turbo` processes that might be running with SIGKILL
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
