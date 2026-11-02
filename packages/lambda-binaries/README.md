# @remotion/lambda-binaries

Private workspace package for building and publishing Remotion Lambda layers. It is not published to npm.

The tooling was imported from [`remotion-dev/lambda-binaries`](https://github.com/remotion-dev/lambda-binaries/tree/3bf7dedd3a626f9ba4438741dac8c0391de76b07). Binary files and their Git history are not part of this package. `binaries.json` pins the original layer archives, their sizes, and their SHA-256 checksums on `remotion.media`.

## Customize layers

Install the monorepo dependencies with `bun install`, then run these commands from `packages/lambda-binaries`. Bun, `unzip`, `zip`, and `du` are required.

```sh
bun run download
# Edit files in layers/chromium, layers/fonts, layers/emoji-apple,
# layers/emoji-google, or layers/cjk.
bun run size
bun run zip
```

The ZIP files appear in `out/` and preserve the layout expected by AWS Lambda. Follow the [custom-layer documentation](https://www.remotion.dev/docs/lambda/custom-layers) to deploy them to your own account.

`bun run download chromium fonts` downloads selected layers. Downloads are verified before extraction and cached in `.cache/`. Existing layer directories are preserved so rerunning the command does not overwrite customizations. To restore a layer, remove its directory under `layers/` and rerun the download command.

The checked-in `fonts.conf` is copied into the fonts layer when it is first extracted. Edit `layers/fonts/fonts.conf` for local customizations. The Noto Sans license is retained both in the font archive and in `licenses/NotoSans.txt`.

`layers/`, `.cache/`, and `out/` are ignored by Git. Neither `bun install` nor the regular monorepo build downloads or packages binaries.

## Maintain the hosted layers

The maintained Chromium build recipes are in [`../chrome-compile`](../chrome-compile). `build-chrome.sh` preserves the original historical Amazon Linux 2023 ARM64 recipe and is not run by any package script.

For a new binary release:

1. Prepare and test the new layer contents, and increment the binary version in `binaries.json`. This version is independent of the Remotion npm version.
2. Run `bun run zip`. Upload the archives to new, immutable keys under `https://remotion.media/lambda-binaries/v<version>/`. Update the manifest's source commit, URL, sizes, and SHA-256 checksums to match the uploaded artifacts. Never overwrite an existing artifact URL.
3. With credentials for the Remotion AWS account (`678892195805`), run `bun run upload --test`. This uploads only to the existing `eu-central-1` S3 bucket.
4. Update the binary version and Chromium license metadata in [`make-layer-public.ts`](../lambda/src/admin/make-layer-public.ts), then run it for `--region=eu-central-1` from `packages/lambda`. Use its returned layer versions to update [`hosted-layers.ts`](../lambda/src/shared/hosted-layers.ts) and verify a Lambda render.
5. After verifying the test region, run `bun run upload` to copy the archives to all supported regional S3 buckets. Publish the corresponding Lambda layers and update their versions in `hosted-layers.ts`.

The upload script verifies the AWS account and all five ZIPs before uploading. It stops on a failed upload. R2 hosts the downloadable source archives; AWS S3 remains the input for publishing regional Lambda layers. Custom layers should be deployed to your own AWS account using the documentation above.
