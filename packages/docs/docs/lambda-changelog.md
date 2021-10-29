---
id: lambda-changelog
title: Changelog
slug: /lambda/changelog
---

Keep track of changes to the APIs of Remotion Lambda here.

## How to upgrade

1. Get the newest version from the `#lambda` Discord channel.
1. Upgrade all packages to the newest version (`@remotion/lambda`, but also `remotion`, `@remotion/cli` etc.)
1. Remove all existing lambdas: `npx remotion-lambda functions ls` and then `npx remotion-lambda functions rm <function-name>`
1. Redeploy your function: `npx remotion lambda functions deploy`
1. Migrate according to the changelog below:

## Unreleased

- ⚠️ `deploySite()` now returns `serveUrl` instead of `url`
- `renderStillOnLambda()` returns a new field: `renderId`
- Documented `downloadVideo()` method
- `downloadVideo()` return value property renamed from `size` to `sizeInBytes`
- Command `npx remotion lambda sites ls` now supports `-q` flag
- `getSites()` command now returns a `serveUrl` for each site

## October 29th, 2021

Version hash: `3.0.0-lambda.42+838a7a013`
Lambda version: '2021-10-29'

- Merged changes from Remotion 2.5.1

## October 27th, 2021

Version hash: `3.0.0-lambda.37+874f731d5`
Lambda version: '2021-10-27'

- Added a new `saveBrowserLogs` / `--save-browser-logs` option for dumping browser logs to an S3 bucket (you are responsible for cleaning up the logs if you enable this option!)
- Fixed a bug where `NoSuchKey` exception could be thrown when calling `getRenderProgress()`
- Merged changes from Remotion 2.5

## October 21st, 2021

Version hash: `3.0.0-lambda.25+9573ee628`

- You can now import the functions `getRenderProgress()`, `renderVideoOnLambda()`, and `renderStillOnLambda()` via `@remotion/lambda/client` free of Node.JS dependencies. That means they should be importable in the browser and React Native and should be lightweight to bundle. This is not yet tested well, let us know your experiences!
- When rendering a video via the Lambda CLI, FFMPEG is no longer required.
- From `main` branch: Calling `getInputProps()` from `remotion` package on the server will no longer fail, but warn and return an empty object.
- Added a way to disable chunk optimization and added some explainer graphics for what chunk optimization is - full doc coming later.
- Pinned exact Remotion versions to avoid a version mismatch with Yarn

## October 20th, 2021

Version hash: `3.0.0-lambda.2+a97302554`

- Updated with all the changes from main branch.

## October 7th, 2021

Version hash: `2.5.0-alpha.da8c43b8`

_Note: This version in broken. Don't use it._

- A new `privacy` field determines if the video will be public of private once it's rendered. No default - this field is mandatory
- New `overallProgress` field in `getRenderProgress()` which can be used to display a progress bar to end users
- The `getSites()` method returns a property `sizeInBytes` which was previously `size`.
- The `deleteSite()` method returns a property `totalSizeInBytes` which was previously `totalSize`.
- Lambda layers are now hosted in a dedicated AWS account
- Documented `getSites()` and `deleteSite()` methods
- Improved progress display for `npx remotion lambda` command
- Now showing estimated cost for `npx remotion lambda` command
- Using the `ANGLE` OpenGL renderer for Chrome instead of SwiftShader

## October 3rd, 2021

Version hash: `2.5.0-alpha.5da9a754`

Refactor of the Lambda layer architecture to bring the following benefits:

- Free up more than 200 MB in the `/tmp` directory to allow for longer videos to be rendered
- Avoid having to unzip Chromium and FFMPEG on every function launch, saving 300-400ms on every function launch
- Removed the need for `lambda:ListLayers`, `lambda:DeleteLayerVersion`, `lambda:GetLayerVersion` and `lambda:PublishLayerVersion` permission.
- Removed the need to call `ensureLambdaBinaries()`. The function and docs for it have been deleted, remove it from your implementation as well. You also don't need to pass `layerArn` to `deployFunction` anymore either.

Also:

- Fixed a bug where a `ENOENT` exception could be thrown during render
- Improved time to deploy a function by removing need to bundle the function first.
- Removed `esbuild`, `zip-lib` and `p-retry` dependendencies to make library more lightweight.

## October 1th, 2021

Version hash: `2.5.0-alpha.b52a746f`

- Renamed `deployProject()` to `deploySite()`.
- Exported `getSites()` and `deleteSite()` methods (not documented yet)
- Added `siteName` to the options of `deploySite()` - now you can define the name of your site yourself, and redeploy to keep the same site.
- Replace `estimatedLambdaInvokations` with `estimatedRenderLambdaInvokations`.
- Rename `bucketSize` to `renderSize`. This property is reporting the size of the render, not the size of the bucket.
- Added `downloadVideo()` API (not documented yet)
- If you add a filename to the end of the render command `npx remotion lambda render [url] [comp-name] out.mp4`, the video will be downloaded to your computer!
- `npx remotion lambda render` has a progress bar now. To continue to see all details, use the `--log=verbose` flag!

## September 15th, 2021

Version hash: `2.4.0-alpha.d3efed28`

- Added `framesPerLambda` setting to `renderVideoOnLambda()`.
- Added `--frames-per-lambda` option to `npx remotion lambda render` command.
- Added `enableCaching` and `webpackOverride` options to `deployProject()` function.
- Webpack override and webpack caching is now respected when deploying from the CLI

## September 14th, 2021

Version hash: `2.4.0-alpha.91579e8b`

- Fixes a bug where `npx remotion lambda policies user` could not be executed without AWS credentials which is a paradox.
- Fixes a bug where a render could fail with an error `Frame X was not rendered`

## September 7th, 2021

Version hash: `2.4.0-alpha.ec355aba`

- Pins the version of AWS SDKs, since a new version broke some things.

## September 6th, 2021

Version hash: `2.4.0-alpha.41bfd52d`

- Added more font families to support Arabic, Devanagari, Hebrew, Tamil, Thai scripts.
- Added input props to the render metadata that gets persisted for each render to help debugging.

## August 6th, 2021

Version hash: `2.3.0-alpha.0d814aad`

- Node.JS API is now fully documented
- Lambda function `name` was renamed to `functionName`
- Fix `remotion lambda policies validate` wrongly indicating that the `iam:GetUser` permission was not given
- `getDeployedLambdas()` was renamed to `getFunctions()`
- `getFunctionVersion()` was removed, use `getFunctionInfo()`
- New function `estimatePrice` is now available.
- Parameter `memorySize` was renamed to `memorySizeInMb` globally.
- New function [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda) available for rendering a still image.
- New command [`npx remotion lambda still`](/docs/lambda/cli) for rendering a still image
- React component lifecycle change: When the component is mounting, initially `useCurrentFrame()` returns the frame that is initially being rendered, rather than just `0` and then updating to the frame that will be initially rendered.
- Includes all the changes from Remotion 2.2

## July 14th, 2021

- Emojis are now rendered using the Noto Color Emoji font
- Better price calculation
- Cleanup of S3 buckets after rendering

## July 6th, 2021

- You can now use `npx remotion lambda` instead of `npx remotion-lambda`.
- CLI supports the `-y` ('yes') flag for skipping confirmation of destructive commands.
- Stability, memory management and reliability improved
- Lambda runtime and Region selection now documented
- `renderVideoOnLambda()` and `getRenderProgress` now documented.
- `deployLambda()` has been renamed to `deployFunction()`
