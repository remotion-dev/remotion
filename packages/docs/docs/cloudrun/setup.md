---
image: /generated/articles-docs-cloudrun-setup.png
id: setup
title: Setup
slug: /cloudrun/setup
crumb: "Cloudrun"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 1. Install `@remotion/cloudrun`

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/cloudrun
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/cloudrun
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add @remotion/cloudrun
```

  </TabItem>

</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

Your package.json should look like the following:

```json
  "@remotion/cli": "3.0.0", // Replace 3.0.0 with the current version
  "@remotion/cloudrun": "3.0.0", // Remove any `^` character
  // ...
  "remotion": "3.0.0",
```

## 2. Create a GCP project

Navigate to the [Manage Resources](https://console.cloud.google.com/cloud-resource-manager?walkthrough_id=resource-manager--create-project&start_index=1#step_index=1) screen in Google Cloud Console.

- On the Select organization drop-down list at the top of the page, select the organization resource in which you want to create a project. If you are a free trial user, skip this step, as this list does not appear.
- Click Create Project.
- In the New Project window that appears, enter a project name and select a billing account as applicable. A project name can contain only letters, numbers, single quotes, hyphens, spaces, or exclamation points, and must be between 4 and 30 characters.
- Enter the parent organization or folder resource in the Location box. That resource will be the hierarchical parent of the new project. If No organization is an option, you can select it to create your new project as the top level of its own resource hierarchy.
- When you're finished entering new project details, click Create.

## 3. Enable billing in the GCP Project

In order to enable the Cloud Run API, billing must be enabled in this project. Navigate to the [Billing](https://console.cloud.google.com/billing) screen in Google Cloud Console. Follow the on-screen prompts to create a billing account, and then link the new project to this billing account.

## 4. Setup Permissions / APIs / Service Account in GCP

_Note, this process does not require an understanding of Terraform._  
[Google Cloud Shell](https://cloud.google.com/shell) is a browser-based command-line interface (CLI) for managing resources and applications hosted on GCP. It provides a virtual machine with pre-installed command-line tools and utilities, including the Google Cloud SDK and Terraform.

Google Cloud Shell is fully integrated with GCP, which means that you can access your projects, resources, and services directly from the command line without having to switch between multiple interfaces. Additionally, Cloud Shell offers a persistent disk for storing your data and files, as well as a web-based code editor for editing files and running scripts.

This means that you can pull in a script that runs a couple of gcloud and Terraform commands, and have a Remotion-ready GCP project in minutes 🚀.

1. In the top right hand corner of the screen, click the Activate Cloud Shell icon

   <img src="/img/cloudrun/selectCloudShell.jpg" width="200" />

2. Within the Cloud Shell, type the following command and follow the prompts.

   ```bash
   curl -L https://raw.githubusercontent.com/UmungoBungo/remotion/gcp-lambda-alternative/packages/cloudrun/gcpInstaller/gcpInstaller.tar | tar -x --strip-components=1 -C . && node install.mjs
   ```

   _The first command downloads a tar file from the Remotion repo, and extracts it to the current directory. The second command runs the installer script._

   If this is the first time initialising Remotion in the GCP project, you will want to select option 1.

   If you are [updating the version of Remotion for this GCP project](./updateGcpProject.md), you will want to select option 2.  
   If you want to [generate a new .env file](./generateEnvFile.md), or manage keys already created, you will want to select option 3.
   <!-- ToDo - host this in the official Remotion repo -->

3. Download the .env file by clicking the vertical ellipsis, in the top right of the cloud shell window, and selecting Download. Then type .env at the end of the prefilled path, and click DOWNLOAD;  
    <img src="/img/cloudrun/downloadEnv.jpg" width="350" />  
   <br />
   <br />
   <img src="/img/cloudrun/downloadEnvFolder.png" width="300" />

4. Remove the .env file from the virtual machine, using this command;

   ```bash
   rm .env
   ```

5. Place the downloaded .env file into the root of the Remotion project. You may need to rename it from `env.txt`, to `.env`. The file should have this format;

   ```txt title=".env"
   REMOTION_GCP_PRIVATE_KEY=<private key>
   REMOTION_GCP_CLIENT_EMAIL=<client email>
   REMOTION_GCP_PROJECT_ID=<project id>
   ```

## 5. Optional: Validate the permission setup

From within your code base, run the following command to validate the permissions are setup correctly in GCP. As long as your GCP project was setup with a matching Remotion version, this should pass.

```
npx remotion cloudrun policies validate
```

<hr/>

For the following steps, you may execute them on the CLI, or programmatically using the Node.JS APIs.

## 6. Deploy a function

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Deploy a function that can render videos into your AWS account by executing the following command:

```bash
npx remotion lambda functions deploy
```

</TabItem>
<TabItem value="node">

You can deploy a function that can render videos into your AWS account using [`deployFunction()`](/docs/lambda/deployfunction).

```ts twoslash
// @module: ESNext
// @target: ESNext
import { deployFunction } from "@remotion/lambda";

// ---cut---
const { functionName } = await deployFunction({
  region: "us-east-1",
  timeoutInSeconds: 120,
  memorySizeInMb: 2048,
  createCloudWatchLogGroup: true,
  architecture: "arm64",
});
```

The function name is returned which you'll need for rendering.
</TabItem>
</Tabs>

The function consists of necessary binaries and JavaScript code that can take a [serve URL](/docs/terminology#serve-url) and make renders from it. A function is bound to the Remotion version, if you upgrade Remotion, you [need to deploy a new function](/docs/lambda/upgrading). A function does not include your Remotion code, it will be deployed in the next step instead.

## 9. Deploy a site

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Run the following command to deploy your Remotion project to an S3 bucket. Pass as the last argument the [entry point](/docs/terminology#entry-point) of the project.

```bash
npx remotion lambda sites create src/index.ts --site-name=my-video
```

A [`serveUrl`](/docs/terminology#serve-url) will be printed pointing to the deployed project.

When you update your Remotion video in the future, redeploy your site. Pass the same [`--site-name`](/docs/lambda/cli/sites#--site-name) to overwrite the previous deploy. If you don't pass [`--site-name`](/docs/lambda/cli/sites#--site-name), a unique URL will be generated on every deploy.

</TabItem>
<TabItem value="node">

First, you need to create an S3 bucket in your preferred region. If one already exists, it will be used instead:

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from "path";
import { deploySite, getOrCreateBucket } from "@remotion/lambda";

const { bucketName } = await getOrCreateBucket({
  region: "us-east-1",
});
```

Next, upload your Remotion project to an S3 bucket. Specify the entry point of your Remotion project, this is the file where [`registerRoot()`](/docs/register-root) is called.

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from "path";
import { deploySite, getOrCreateBucket } from "@remotion/lambda";

const { bucketName } = await getOrCreateBucket({
  region: "us-east-1",
});
// ---cut---
const { serveUrl } = await deploySite({
  bucketName,
  entryPoint: path.resolve(process.cwd(), "src/index.ts"),
  region: "us-east-1",
  siteName: "my-video",
});
```

When you update your Remotion video in the future, redeploy your site. Pass the same [`siteName`](/docs/lambda/deploysite#sitename) to overwrite the previous deploy. If you don't pass [`siteName`](/docs/lambda/deploysite#sitename), a unique URL will be generated on every deploy.

</TabItem>
</Tabs>

## 10. Check AWS concurrency limit

Check the concurrency limit that AWS has given to your account:

```
npx remotion lambda quotas
```

By default, it is `1000` concurrent invocations per region. However, new accounts might have a limit [as low as `10`](/docs/lambda/troubleshooting/rate-limit). Each Remotion render may use as much as 200 functions per render concurrently, so if your assigned limit is very low, [you might want to request an increase right away](/docs/lambda/troubleshooting/rate-limit).

## 11. Render a video

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Take the URL you received from the step 8 - your "serve URL" - and run the following command. Also pass in the [ID of the composition](/docs/composition) you'd like to render.

```bash
npx remotion lambda render <serve-url> <composition-id>
```

Progress will be printed until the video finished rendering. Congrats! You rendered your first video using Remotion Lambda 🚀

</TabItem>
<TabItem value="node">

You already have the function name from a previous step. But since you only need to deploy a function once, it's useful to retrieve the name of your deployed function programmatically before rendering a video in case your Node.JS program restarts. We can call [`getFunctions()`](/docs/lambda/getfunctions) with the `compatibleOnly` flag to get only functions with a matching version.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda";

const functions = await getFunctions({
  region: "us-east-1",
  compatibleOnly: true,
});

const functionName = functions[0].functionName;
```

We can now trigger a render using the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda";

const url = "string";
const functions = await getFunctions({
  region: "us-east-1",
  compatibleOnly: true,
});

const functionName = functions[0].functionName;
// ---cut---

const { renderId, bucketName } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName,
  serveUrl: url,
  composition: "HelloWorld",
  inputProps: {},
  codec: "h264",
  imageFormat: "jpeg",
  maxRetries: 1,
  framesPerLambda: 20,
  privacy: "public",
});
```

The render will now run and after a while the video will be available in your S3 bucket. You can at any time get the status of the video render by calling [`getRenderProgress()`](/docs/lambda/getrenderprogress).

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda";

const url = "string";
const functions = await getFunctions({
  region: "us-east-1",
  compatibleOnly: true,
});

const functionName = functions[0].functionName;

const { renderId, bucketName } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName,
  serveUrl: url,
  composition: "HelloWorld",
  inputProps: {},
  codec: "h264",
  imageFormat: "jpeg",
  maxRetries: 1,
  framesPerLambda: 20,
  privacy: "public",
});
// ---cut---
while (true) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName,
    region: "us-east-1",
  });
  if (progress.done) {
    console.log("Render finished!", progress.outputFile);
    process.exit(0);
  }
  if (progress.fatalErrorEncountered) {
    console.error("Error enountered", progress.errors);
    process.exit(1);
  }
}
```

This code will poll every second to check the progress of the video and exit the script if the render is done. Congrats! [Check your S3 Bucket](https://s3.console.aws.amazon.com/s3/) - you just rendered your first video using Remotion Lambda 🚀

</TabItem>
</Tabs>

## Next steps

- Select [which region(s)](/docs/lambda/region-selection) you want to run Remotion Lambda in.
- Familiarize yourself with the CLI and the Node.JS APIs (list in sidebar).
- Learn how to [upgrade Remotion Lambda](/docs/lambda/upgrading).
- Before going live, go through the [Production checklist](/docs/lambda/checklist).
- If you have any questions, go through the [FAQ](/docs/lambda/faq) or ask in our [Discord channel](https://remotion.dev/discord)
