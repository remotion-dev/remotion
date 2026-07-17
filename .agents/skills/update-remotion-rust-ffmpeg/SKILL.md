---
name: update-remotion-rust-ffmpeg
description: Update Remotion's ffmpeg-next Git revision to a published rust-ffmpeg commit, refresh Cargo.lock, rebuild all supported compositor binaries, validate the monorepo, and open a draft pull request. Use for the final step of the rust-ffmpeg binary update chain.
---

# Update Remotion Rust FFmpeg

Require the full published `rust-ffmpeg` commit SHA from `$update-rust-ffmpeg-sys`.

Read [`../pr/SKILL.md`](../pr/SKILL.md) and [`../pr-name/SKILL.md`](../pr-name/SKILL.md) before committing or opening the pull request.

## Prepare the worktree

Run from the dedicated Remotion worktree on `codex/update-rust-ffmpeg`. Never perform this work in the primary `/Users/jonathanburger/remotion` checkout.

Fetch `origin`. If the branch has no release commits yet, fast-forward it to `origin/main`. Do not rebase, reset, or overwrite unrelated work.

Allow this skill's own tracked `.agents/skills/update-remotion-rust-ffmpeg` files to exist unchanged. Stop on any pre-existing change that is not explicitly part of the requested pull request.

Verify that the supplied full SHA is reachable from `remotion-dev/rust-ffmpeg`'s `main` branch. Read that commit's `Cargo.toml` and record the exact `ffmpeg-sys-next` revision for later lockfile verification.

## Update Cargo and rebuild artifacts

Change only the `ffmpeg-next.rev` value in `packages/compositor/Cargo.toml` to the supplied full SHA. From `packages/compositor`, run:

```sh
cargo update -p ffmpeg-next
```

Verify in `Cargo.lock` that:

- `ffmpeg-next` resolves to the supplied `rust-ffmpeg` SHA;
- `ffmpeg-sys-next` resolves to the recorded `rust-ffmpeg-sys` SHA.

Install workspace dependencies without changing the lockfile:

```sh
bun install --frozen-lockfile
```

Install cross-compilation toolchains if `packages/compositor/toolchains` is absent:

```sh
cd packages/compositor
bun install-toolchain.ts
bun run build-all
```

The all-platform build must complete for Windows x64 GNU, macOS ARM64/x64, and Linux ARM64/x64 GNU/musl. On macOS, ensure an MSVCRT-targeting `x86_64-w64-mingw32-gcc` linker is available before running the build; do not use a UCRT-defaulting toolchain. It refreshes both the `remotion` executables and the FFmpeg shared libraries/CLI files in their platform packages. Do not substitute a native-only build.

From the repository root, run:

```sh
bun run build
bun run stylecheck
git diff --check
```

Inspect the diff. It may contain:

- `packages/compositor/Cargo.toml` and `packages/compositor/Cargo.lock`;
- rebuilt files under the six `packages/compositor-{darwin,linux}-*` platform packages and `packages/compositor-win32-x64-msvc`.

Stop if unrelated tracked files changed. Confirm that the Windows compositor package changed, including `remotion.exe` and the FFmpeg files from the updated archive. Run `objdump -p packages/compositor-win32-x64-msvc/remotion.exe`: require `msvcrt.dll` and reject `api-ms-win-crt-*` or `ucrtbase.dll` imports.

## Commit, push, and open the PR

Before committing, check for an existing pull request for the current branch. If one exists, report it and stop instead of duplicating or rewriting it.

Stage only the two Cargo files, the seven rebuilt compositor platform packages, `packages/compositor/build.ts`, and any intentional update to this skill. Use this commit and PR title:

```text
`@remotion/compositor`: Update rust-ffmpeg and rebuild binaries
```

Push once with `git push -u origin HEAD`. Never force-push. If the push is rejected, stop and report it.

Write a concise PR body to a temporary Markdown file. Include the full `rust-ffmpeg` and `rust-ffmpeg-sys` SHAs, the splitter source SHA if available in the handoff, the seven rebuilt targets, and validation results. Create a draft PR against `main` with `gh pr create --draft --body-file`; do not pass the body inline.

## Finish the chain

Report the PR URL, branch, all three source commit SHAs available in the handoff, rebuilt targets, and validation results. There is no next repository; the multi-repository update chain is complete.
