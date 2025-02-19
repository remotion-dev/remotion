---
image: /generated/articles-docs-lambda-changelog.png
id: changelog
title: Prerelease Changelog
slug: /lambda/changelog
---

## Stable versions

From 3.0.0 onwards, the changelog is located in the main [Remotion changelog on GitHub](https://github.com/remotion-dev/remotion/releases). This document contains the changelog for prereleases and will not be updated anymore!

## Prerelease versions

### April 20th, 2022

Version hash: `3.0.0-rc.15`  
Lambda version: '2022-04-20'

- Fixes an issue where `getInputProps()` and environment variables were not available outside of a component (regression introduced in '2022-02-14')

### April 19th, 2022

Version hash: `3.0.0-rc.7`  
Lambda version: '2022-04-19'

- Fixes an issue where `REMOTION_AWS_ACCESS_KEY` and `REMOTION_AWS_SECRET_ACCESS_KEY` environment variables would not be recognized inside Vercel serverless functions.

### April 18th, 2022

Version hash: `3.0.0-rc.1`  
Lambda version: '2022-04-18'

- React 18 Support - you can update `react`, `react-dom` and `@types/react` to opt into React 18!
- ESLint 8 support - you can update to use the new version!
- Minimum version is now Node 14.
- In the CLI, render errors are symbolicated, even for Lambda renders!

Thanks for giving it a try and let us know if there are any problems, before we launch soon!

### April 5th, 2022

_Experimental version, stay with '2022-03-17' for well-tested version!_

Version hash: `3.0.0-lambda.439+8583491c7`  
Lambda version: '2022-04-05'

- When uploading files to S3, add the appropriate MIME type to every file. For example an .mp3 file has an `audio/mpeg` Content-Type.
- Changes from 2.6.13

### April 2nd, 2022

_Experimental version, stay with '2022-03-17' for well-tested version!_

Version hash: `3.0.0-lambda.424+994a31b6b`  
Lambda version: '2022-04-02'

Added the option to increase the Lambda disk space and therefore enable rendering of longer videos: [/docs/lambda/disk-size]

- You can set a disk space of up to 10GB
- Adding more storage has a miniscule effect on price. According to our calculation, having 10GB of storage instead of the default 512MB adds only ~0.2% to the cost of Lambda.
- Breaking change: The `estimatePrice()` method now takes CPU architecture, disk size and number of lambdas invoked into account. These parameters have been added to the function and been made mandatory.
- Fixes a bug where `--frames-per-lambda` would be set to 20 instead of the dynamic value suggested by the docs, if rendered via CLI.

### March 29th, 2022

_Broken version, stay with '2022-03-17' for well-tested version or upgrade to '2022-04-02' for fixed version_

Version hash: `3.0.0-lambda.419+1ae289d8c`  
Lambda version: '2022-03-29'

### March 17th, 2022

Version hash: `3.0.0-lambda.414+163634f42`  
Lambda version: '2022-03-17'

- Added a new [`npx remotion lambda quotas`](/docs/lambda/cli/quotas) command which allows you to see your current AWS Lambda concurrency limit
- Added a new [`npx remotion lambdas quotas increase`](/docs/lambda/cli/quotas) command which allows you to bump your AWS Lambda concurrency limit

:::info
For these commands to work, you have to re-setup the AWS policies as described in the [setup](/docs/lambda/setup)
:::

- Fixed a bug where combining mono and stereo audio would cause the mono audio to speed up

### March 3rd, 2022

Version hash: `3.0.0-lambda.404+70a7d3fec`  
Lambda version: '2022-03-02'

_✅ Tested again and now recommended to upgrade_

- Fixed a regression where input props would not be passed into the component while rendering.

### March 1st, 2022

:::note
Experimental: Prefer '2022-02-14' version for stability.
You need to rebundle and redeploy your projects for this version.
:::

Version hash: `3.0.0-lambda.400+3b736b911`  
Lambda version: '2022-03-01'

- Fixes an issue where the `<Player />` would display the video smaller if the parent element of the player had a `scale()` transform applied to it
- Bug fixed: Would not recognize a deployed Remotion function if there are a lot of functions in one AWS account.

### February 27th, 2022

:::note
Experimental: Prefer '2022-02-14' version for stability.
You need to rebundle and redeploy your projects for this version.
:::

Version hash: `3.0.0-lambda.295+67a488af4`  
Lambda version: '2022-02-27'

- Allows to store an output in a different bucket - see documentation for [`outName`](/docs/lambda/rendermediaonlambda#outname)
- Rearchitecture to lift the 5MB input props/environment variable limit.

### February 14th, 2022

Version hash: `3.0.0-lambda.388+6e1372eca`  
Lambda version: '2022-02-14'

This update addresses an issue where Lambda functions would crash with the following error message:

```
Error: Failed to launch the browser process!\n/opt/bin/chromium: relocation error: /lib64/librt.so.1: symbol \_\_pthread_attr_copy, version GLIBC_PRIVATE not defined in file libpthread.so.0 with link time reference
```

We recommend all Remotion Lambda users to upgrade, as AWS Lambda is slowly rolling out a new environment for the Node.JS 14 stack and you will see elevated error rates with the old versions. Their new stack upgrades the glibc library in Amazon Linux 2, which requires new symbols in the libpthread shared object. We also shipped this shared object in our Lambda layer and it was taking precedence over the preinstalled one, leading to this error. We recommend the default arm64 deployment.

We have removed this file and also reviewed our layer for other files that could potentially lead to similar issues in the future. So we hope this issue will never come back!

### February 12th, 2022

Version hash: `3.0.0-lambda.381+2a6cb78f1`
Lambda version: '2022-02-12'

Update focused on stability:

- Chunk optimization has been removed, since it sometimes breaks renders. We hope to add it back after launch.
- All npm dependencies have been pinned to their exact version.

### February 8th, 2022

Version hash: `3.0.0-lambda.359+59cc0e49b`
Lambda version: '2022-02-09'

- Fixes an error not being able to bundle using Webpack if not using Typescript.

### February 7th, 2022

Version hash: `3.0.0-lambda.355+6b0269d52`
Lambda version: '2022-02-08'

Fixes the following regressions and adds tests for it:

- Fixes error where Output media has no audio
- Importing `@remotion/lambda/client` no longer triggers a puppeteer error inside a Lambda function.
- Fixes an error coming up during deploy saying ESBuild binaries are missing
- Upgrade ESBuild to 0.14.9

### February 4th, 2022 (4)

Version hash: `3.0.0-lambda.337+bde12456c`
Lambda version: '2022-02-07'

Fixes regressions:

- Fixes `@remotion/lambda/client` not being available

### February 4th, 2022 (3)

Version hash: `3.0.0-lambda.332+da8c03491`
Lambda version: '2022-02-06'

Fixes regressions:

- Fixes not being able to render transparent WebM on Lamba.

### February 4th, 2022 (2)

Version hash: `3.0.0-lambda.329+f23080b59`
Lambda version: '2022-02-05'

Fixes regressions:

- Fixes Lambda returning an `EISDIR` error when rendering stills.
- Better error message when not passing `serveUrl` to `renderMediaOnLambda()`.

### February 4th, 2022

Version hash: `3.0.0-lambda.338+118ffe2e9`
Lambda version: '2022-02-04'

Attention: Some Lambda functions are breaking from an AWS change, especially on `us-east-1` and `us-east-2`. We are worried that AWS is slowly rolling out a broken update to their Lambda functions. If you are affected or want to be on the safe side, [read these instructions](/docs/lambda/feb-2022-outage) to avoid the AWS issues.

- [Allows you to deploy as a `x86_64` Lambda function](/docs/lambda/feb-2022-outage)

### February 3rd, 2022

Version hash: `3.0.0-lambda.327+85d431c9c`
Lambda version: '2022-02-03'

- fix transparent webm rendering
- all changes from 2.6.5 through 2.6.7: including new scale option also for lambda! https://www.remotion.dev/docs/scaling
- chromium flags can now be set on lambda as well: https://www.remotion.dev/docs/chromium-flags

### January 23rd, 2022

Version hash: `3.0.0-lambda.310+7b7d16823`  
Lambda version: '2022-01-23'

- Update with improvements from v2.6.5

### January 19th, 2022

Version hash: `3.0.0-lambda.297+0a5487655`  
Lambda version: '2022-01-19'

- Added `timeoutInMilliseconds` to `renderMediaOnLambda`, `renderStillOnLambda` and `renderMedia`
- New APIs: [`presignUrl()`](/docs/lambda/presignurl) and [`getAwsClient()`](/docs/lambda/getawsclient)
- Added `outKey` which returns the S3 Key for the output artifact of a render

### January 10th, 2022 (2)

Version hash: `3.0.0-lambda.279+ee1497f24`  
Lambda version: '2022-01-11'

- Fixes the render erroring if `framesPerLambda` is not specified. To be clear, this parameter stays optional.

### January 10th, 2022

Version hash: `3.0.0-lambda.274+a3183304a`  
Lambda version: '2022-01-10'

- New option to allow the filename of the output: `outName` in `renderMedia` / `renderStill` and `--out-name` in CLI flags
- Reenable WebGL support
- Update to Chromium 97
- New algorithm for determining default concurrency: https://remotion.dev/docs/lambda/concurrency
- Better error message if concurrency is too high
- Remove `colors` module
- Fixes an error where payload limit would be reached because `defaultProps` had a big size
- Add @aws-sdk/abort-controller peer dependency explicitly to fix npm7 error

### January 6th, 2022

Version hash: `3.0.0-lambda.244+d055311e8`  
Lambda version: '2022-01-06'

- Added changes from Remotion 2.6.0 and 2.6.1
- Improved error message when spawning more than 200 functions

Beware of not spawning over 200 functions. `functionCount = frameCount / framesPerLambda` (by default `framesPerLambda` is 20). We will make it smarter or document it better before the official launch.

### January 5th, 2022

**Release possibly breaks render, don't upgrade yet!**

~~Version hash: `3.0.0-lambda.237+8e8a607c9`~~
~~Lambda version: '2022-01-05'~~

- Added changes from Remotion 2.6
- Improved error message when spawning more than 200 functions

Beware of not spawning over 200 functions. `functionCount = frameCount / framesPerLambda` (by default `framesPerLambda` is 20). We will make it smarter or document it better before the official launch.

### December 22nd, 2021

Version hash: `3.0.0-lambda.288+6ab6c681d`
Lambda version: '2021-12-22'

- Visiting a Serve URL in the browser shows a FAQ
- Vast improvements to documentation, CLI documentation is now complete!
- `downloadVideo()` was renamed to `downloadMedia()`. The previous API continues to be available, but is marked as deprecated.
- `renderVideoOnLambda()` was renamed to `renderMediaOnLambda()`. The previous API continues to be available, but is marked as deprecated.
- Limited the maximum amount of functions that you can invoke for one render to 200 functions. That means, if your render is 1000 frames, your `framesPerLambda` parameter must be at least `5`. Rendering with a higher concurrency will reduce the amount of videos you can render in parallel and diminish the benefits of concurrency.
- Added [`getRegions()`](/docs/lambda/getregions) API
- Added [`npx remotion lambda regions`](/docs/lambda/cli/regions) command

### December 15th, 2021 (2)

Version hash: `3.0.0-lambda.236+b35e791d5`
Lambda version: '2021-12-17'

Fixes an error being thrown in the Lambda function: `The AWS access Key ID you provided does not exist in your records`.

### December 15th, 2021

Version hash: `3.0.0-lambda.233+869dd7218`  
Lambda version: '2021-12-16'

Stability and ease of use improvements that we implemented from our learnings from https://githubwrapped.com!

- Fixed an error `Parameter 'durationInMilliseconds' must be over 0 but is [negative number]`
- The function name of a deployed function is not random anymore. Instead it has the format of `remotion-render-2021-12-16-2048mb-120sec`
- More CLI commands support the `-q` (quiet) flag.
- Calling `npx remotion lambda functions deploy` if a suitable function already exists will not throw an error anymore but log the existing function.
- Calling `deployFunction()` if a suitable function already exists will not throw an error anymore but return the existing function.
- You can now deploy another function with the same region and version, but with a different memory size or timeout. This allows you to increase memory size or timeout without causing downtime. [Read more about it here.](/docs/lambda/faq#do-i-need-to-deploy-a-function-for-each-render)
- Improved compatibility with Vercel: Since `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are reserved environment variables on Vercel and are already occupied, you can now set `REMOTION_AWS_ACCESS_KEY_ID` and `REMOTION_AWS_SECRET_ACCESS_KEY` instead for calling any Remotion Lambda Node.JS API.
- Multi-account load balancing: The environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `REMOTION_AWS_ACCESS_KEY_ID` and `REMOTION_AWS_SECRET_ACCESS_KEY` can now be switched before making a call to Lambda. (Previously there was a bug that would cache the clients.)
- If the render is not completed 20 seconds after the timeout of the initial invocation, the render will automatically be marked as failed. No more stuck renders!
- catch errors occuring while assets are being downloaded and trigger a retry (previously would fail the chunk render and make the whole render time out)

### December 10th, 2021 (2)

Version hash: `3.0.0-lambda.206+161f56853`
Lambda version: '2021-12-11'

- Fixes the policy generated by `npx remotion lambda policies user` so AWS accepts it. Update the user policy of your AWS user if you'd like the slimmest set of permissions needed.
- Fixes an issue where an error occuring during `npx remotion lambda policies validate` would not be caught.

### December 10th, 2021

Version hash: `3.0.0-lambda.203+6e2dfd14e`
Lambda version: '2021-12-10'

The Lambda function now prints inputProps that you can read in your CloudWatch logs for easier debugging.

### December 7th, 2021

Version hash: `3.0.0-lambda.196+d4d99a5b8`
Lambda version: '2021-12-04'

_We mistakenly didn't increase the version number in this release. Sorry about this and we will fix this issue._

Fix Korean/Chinese/Japanese fonts from last release where it did not work as expected. Due to space constraints, only Regular weight is supported.

### December 4th, 2021

Version hash: `3.0.0-alpha.192+8e7345b69`
Lambda version: '2021-12-04'

- Support rendering a video partially using `frameRange` / `--frame-range` option
- Improve Setup guide
- Improve CLI documentation
- Deleted `save-browser-logs` function in favour of the new CloudWatch solution. Pass `--log=verbose` instead and see CloudWatch for more detailed logs.
- Retry if the AWS rate limit is exceeded for `npx remotion lambda permissions validate` command and for `validatePermissions()` function.
- New Fonts: `Noto Sans JP`, `Noto Sans Simplified Chinese`, `Noto Sans Traditional Chinese`, `Noto Sans Korean` both in Regular and Bold.

### November 28th, 2021

Version hash: `3.0.0-lambda.158+f214b5355`
Lambda version: '2021-11-29'

- Fixes a bug with `renderVideoOnLambda()`

### November 27th, 2021

Version hash: `3.0.0-lambda.151+ba8c212b9`
Lambda version: '2021-11-27'

Remotion 3.0 Rendering pipeline refactor merged into this branch!

- **Parallel encoding**: Now rendering and encoding happens at the same time! You should see a speed improvement. Also, if you embedded videos with audio, these are now downloaded earlier in the rendering process, which will give the rendering times another boost.
- **Breaking**: Server-side rendering APIs have been refactored. See the separate [3.0 Migration](/docs/3-0-migration) page for it. New `openBrowser()` and `renderMedia()` APIs are now available.
- Downloading a video using the CLI now shows a progress bar.

### November 24th, 2021

Version hash: `3.0.0-lambda.143+08ebdfa17`
Lambda version: '2021-11-24'

- **Breaking**: Migrated to **ARM architecture**! This means 34% better cost/performance ratio. However, only the following 10 regions support ARM architectures: `eu-central-1`, `eu-west-1`, `eu-west-2`, `us-east-1`, `us-east-2`, `us-west-2`, `ap-south-1`, `ap-southeast-1`, `ap-southeast-2`, `ap-northeast-1`.

That means that the previously supported regions `us-west-1`, `af-south-1`, `ap-east-1`, `ap-northeast-2`, `ap-northeast-3`, `ca-central-1`, `eu-west-1`, `eu-west-2`, `eu-south-1`, `eu-west-3`, `eu-north-1`, `me-south-1`, `sa-east-1` are not supported anymore.

We will add those regions back again once AWS adds support for Lambda.

- Fixes an issue where multiple versions of Remotion could appear in a project even though they were pinned down in your `package.json`.
- Fixes an issue where audio could become out of sync if audio with different sample rates was appearing in the video

### November 18th, 2021

Version hash: `3.0.0-lambda.122+a588a81b9`
Lambda version: '2021-11-18'

- The default number of max retries is now 1 (previously 3). A new CLI flag `--max-retries` was introduced which can be used for `npx remotion lambda render` and `npx remotion lambda still`
- You can now pass `--privacy=public` or `--privacy=private` in the CLi to determine if the output video should be publicly accessible. The default is and was `public`.
- Fixes an issue where a Remotion version mismatch could happen.

### November 12th, 2021

Version hash: `3.0.0-lambda.99+bd5d55651`
Lambda version: '2021-11-12'

- **Breaking change**: Update your AWS user and role policies

1. Update to the newest version of Remotion Lambda.
1. Read [Step 2](/docs/lambda/setup#2-create-role-policy) of the setup guide and update the role with the newest policy (`npx remotion lambda policies role`).
1. Read [Step 5](/docs/lambda/setup#5-create-an-access-key-for-the-user) of the setup guide and update the user with the newest policy (`npx remotion lambda policies user`).

- **Breaking change**: If your application throws an error or exception, the render will now fail. This will be the default behavior of Remotion 3.0. See: [3.0 Migration](/docs/3-0-migration)
- Added CloudWatch support, now you can read the logs inside the Lambda function. When you execute `npx remotion lambda render`, add the `--log=verbose` flag to print out an URL to CloudWatch.
- Switched to new rendering mechanism which renders + encodes the video in parallel, saving a significant amount of render time!
- Improved CLI output of `npx remotion lambda render`
- Added changes from 2.5.1 - 2.5.4
- Disabled automatic AWS Lambda retrying in favor of our own retry mechanism

### November 1st, 2021

Version hash: `3.0.0-lambda.57+d1dd7ce77`
Lambda version: '2021-11-01'

- `deploySite()` now returns `serveUrl` instead of `url`
- `renderStillOnLambda()` returns a new field: `renderId`
- Documented `downloadVideo()` method
- `downloadVideo()` return value property renamed from `size` to `sizeInBytes`
- Command `npx remotion lambda sites ls` now supports `-q` flag
- `getSites()` command now returns a `serveUrl` for each site
- Deleted the `cleanup` command - it's obsolete
- Added [Production checklist page](/docs/lambda/checklist)
- Added [Uninstall guide](/docs/lambda/uninstall)

### October 29th, 2021

Version hash: `3.0.0-lambda.42+838a7a013`  
Lambda version: '2021-10-29'

- Merged changes from Remotion 2.5.1

### October 27th, 2021

Version hash: `3.0.0-lambda.37+874f731d5`  
Lambda version: '2021-10-27'

- Added a new `saveBrowserLogs` / `--save-browser-logs` option for dumping browser logs to an S3 bucket (you are responsible for cleaning up the logs if you enable this option!)
- Fixed a bug where `NoSuchKey` exception could be thrown when calling `getRenderProgress()`
- Merged changes from Remotion 2.5

### October 21st, 2021

Version hash: `3.0.0-lambda.25+9573ee628`

- You can now import the functions `getRenderProgress()`, `renderVideoOnLambda()`, and `renderStillOnLambda()` via `@remotion/lambda/client` free of Node.JS dependencies. That means they should be importable in the browser and React Native and should be lightweight to bundle. This is not yet tested well, let us know your experiences!
- When rendering a video via the Lambda CLI, FFMPEG is no longer required.
- From `main` branch: Calling `getInputProps()` from `remotion` package on the server will no longer fail, but warn and return an empty object.
- Added a way to disable chunk optimization and added some explainer graphics for what chunk optimization is - full doc coming later.
- Pinned exact Remotion versions to avoid a version mismatch with Yarn

### October 20th, 2021

Version hash: `3.0.0-lambda.2+a97302554`

- Updated with all the changes from main branch.

### October 7th, 2021

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

### October 3rd, 2021

Version hash: `2.5.0-alpha.5da9a754`

Refactor of the Lambda layer architecture to bring the following benefits:

- Free up more than 200 MB in the `/tmp` directory to allow for longer videos to be rendered
- Avoid having to unzip Chromium and FFMPEG on every function launch, saving 300-400ms on every function launch
- Removed the need for `lambda:ListLayers`, `lambda:DeleteLayerVersion`, `lambda:GetLayerVersion` and `lambda:PublishLayerVersion` permission.
- Removed the need to call `ensureLambdaBinaries()`. The function and docs for it have been deleted, remove it from your implementation as well. You also don't need to pass `layerArn` to `deployFunction` anymore either.

Also:

- Fixed a bug where a `ENOENT` exception could be thrown during render
- Improved time to deploy a function by removing need to bundle the function first.
- Removed `esbuild`, `zip-lib` and `p-retry` dependencies to make library more lightweight.

### October 1th, 2021

Version hash: `2.5.0-alpha.b52a746f`

- Renamed `deployProject()` to `deploySite()`.
- Exported `getSites()` and `deleteSite()` methods (not documented yet)
- Added `siteName` to the options of `deploySite()` - now you can define the name of your site yourself, and redeploy to keep the same site.
- Replace `estimatedLambdaInvokations` with `estimatedRenderLambdaInvokations`.
- Rename `bucketSize` to `renderSize`. This property is reporting the size of the render, not the size of the bucket.
- Added `downloadVideo()` API (not documented yet)
- If you add a filename to the end of the render command `npx remotion lambda render [url] [comp-name] out.mp4`, the video will be downloaded to your computer!
- `npx remotion lambda render` has a progress bar now. To continue to see all details, use the `--log=verbose` flag!

### September 15th, 2021

Version hash: `2.4.0-alpha.d3efed28`

- Added `framesPerLambda` setting to `renderVideoOnLambda()`.
- Added `--frames-per-lambda` option to `npx remotion lambda render` command.
- Added `enableCaching` and `webpackOverride` options to `deployProject()` function.
- Webpack override and webpack caching is now respected when deploying from the CLI

### September 14th, 2021

Version hash: `2.4.0-alpha.91579e8b`

- Fixes a bug where `npx remotion lambda policies user` could not be executed without AWS credentials which is a paradox.
- Fixes a bug where a render could fail with an error `Frame X was not rendered`

### September 7th, 2021

Version hash: `2.4.0-alpha.ec355aba`

- Pins the version of AWS SDKs, since a new version broke some things.

### September 6th, 2021

Version hash: `2.4.0-alpha.41bfd52d`

- Added more font families to support Arabic, Devanagari, Hebrew, Tamil, Thai scripts.
- Added input props to the render metadata that gets persisted for each render to help debugging.

### August 6th, 2021

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

### July 14th, 2021

- Emojis are now rendered using the Noto Color Emoji font
- Better price calculation
- Cleanup of S3 buckets after rendering

### July 6th, 2021

- You can now use `npx remotion lambda` instead of `npx remotion-lambda`.
- CLI supports the `-y` ('yes') flag for skipping confirmation of destructive commands.
- Stability, memory management and reliability improved
- Lambda runtime and Region selection now documented
- `renderVideoOnLambda()` and `getRenderProgress` now documented.
- `deployLambda()` has been renamed to `deployFunction()`
