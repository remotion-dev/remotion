# FFmpeg in the Remotion monorepo

The complete FFmpeg source-build and Rust integration chain lives here:

| Directory  | Purpose                                                                         | Imported repository    |
| ---------- | ------------------------------------------------------------------------------- | ---------------------- |
| `build/`   | Build FFmpeg, codec libraries, patches, bindings and archives for seven targets | `rust-ffmpeg-splitter` |
| `sys/`     | Link FFmpeg and expose the generated C bindings to Rust                         | `rust-ffmpeg-sys`      |
| `wrapper/` | Safe Rust API used by the compositor                                            | `rust-ffmpeg`          |

`../Cargo.toml` depends on `wrapper/`, which depends on `sys/`, using local Cargo paths. The source revisions imported without an FFmpeg upgrade are recorded in `assets.json`. Keep the upstream license notices with these sources.

`packages/lambda-binaries` is already part of the monorepo. It packages Chromium and font layers; the FFmpeg libraries and compositor executable are distributed by the platform-specific `packages/compositor-*` packages. An FFmpeg update does not require changing the Chromium layers.

## Build the compositor

From `packages/compositor`:

```sh
bun build.ts --debug
```

The build downloads only the required target's archive. To use Cargo directly, download the archive first:

```sh
node ffmpeg/download.mjs archives aarch64-apple-darwin
cargo check --locked
```

Replace the target with your Rust target triple. Omit the target to download all seven archives. Neither `bun install` nor the regular TypeScript build downloads FFmpeg assets.

Archives, codec build inputs and test videos are downloaded on demand and checked against the sizes and SHA-256 digests in `assets.json`. All assets are hosted at immutable URLs on `remotion.media`; the old repositories are only referenced for source provenance.

`sys/build.rs` extracts the selected archive into Cargo's output directory and uses the checked-in binding for the same target. Only canonical target names are retained; the old duplicate binding aliases have been removed.

## Rebuild FFmpeg

Run the existing build recipe from `packages/compositor/ffmpeg/build`:

```sh
node ../download.mjs buildInputs
node clean.mjs
node compile-ffmpeg.mjs
node generate-bindings.mjs
node zip.mjs
node test-ffmpeg.mjs
```

The required system dependencies and target arguments are in the CI configurations. macOS builds run in `.github/workflows/ffmpeg.yml`; Linux GNU/musl and Windows GNU builds run in `.circleci/config.yml`. The CircleCI project must be enabled for `remotion-dev/remotion` before collecting a new seven-platform set. The Dockerfiles preserve the ARM build environments. Each job outputs `ffmpeg.tar.gz`, containing FFmpeg, shared libraries, headers and `bindings.rs`.

The small `build/Cargo.toml` intentionally uses a pinned upstream binding generator. It is separate from the compositor's local pre-generated bindings: using `sys/` here would require the archive that this step is generating. Its `Cargo.lock` is retained for reproducibility.

## Update all targets together

Collect the seven artifacts for one successful source commit:

```sh
node packages/compositor/ffmpeg/collect-artifacts.mjs --sha <full-source-sha>
```

This requires `gh` authentication and CircleCI access (`CIRCLE_TOKEN` if required). The collector verifies both providers built the same SHA and produces a directory containing the seven archives, `MANIFEST.json` and `SHA256SUMS`.

Upload the seven archives to a new immutable directory on `remotion.media`, then import them:

```sh
node packages/compositor/ffmpeg/import-artifacts.mjs <artifact-directory> <immutable-https-base-url>
cd packages/compositor
bun run build-all
```

The importer verifies the complete local set, checks the hosted copies, updates the manifest and regenerates the seven checked-in bindings. It leaves the archives in the ignored cache. Commit the manifest, bindings and rebuilt platform packages together in one PR. No intermediate crate commits or dependency revision bumps are needed.

## Further simplification

- Move the five CircleCI builds to GitHub Actions to remove the second provider and most of the collector. Preserve the GNU/musl baselines, macOS deployment target, Windows MSVCRT linkage and runtime tests when doing so.
- Replace the upstream binding-generator crate with a small direct bindgen invocation. Do this separately and compare all seven generated bindings before adopting it.
- Remove the unused bindgen callbacks and build dependencies from `sys/`: it consumes checked-in bindings and never invokes bindgen. Keep the generator dependencies in `build/`, which does generate bindings. Audit the remaining upstream features against compositor usage separately.
