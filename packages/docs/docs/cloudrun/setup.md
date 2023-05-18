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
  "@remotion/cli": "4.0.0", // Replace 4.0.0 with the current version
  "@remotion/cloudrun": "4.0.0", // Remove any `^` character
  // ...
  "remotion": "4.0.0",
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

// TODO: Cannot do relative links in Docusaurus

2. Within the Cloud Shell, type the following command and follow the prompts.
   // TODO: Switch to remotion-dev repo

   ```bash
   curl -L https://github.com/UmungoBungo/remotion/raw/gcp-lambda-alternative/packages/cloudrun/gcpInstaller/gcpInstaller.tar | tar -x --strip-components=1 -C . && node install.mjs
   ```

   _The first command downloads a tar file from the Remotion repo, and extracts it to the current directory. The second command runs the installer script._

   If this is the first time initialising Remotion in the GCP project, you will want to select option 1.
   If you are updating the version of Remotion for this GCP project, you will want to select option 1.
   If you want to [generate a new .env file](./generateEnvFile.md), or manage keys already created, you will want to select option 2. You will be presented with an opportunity to generate this file after completing option 1.

3. Download the .env file by clicking the vertical ellipsis, in the top right of the cloud shell window, and selecting Download. Then type .env at the end of the prefilled path, and click DOWNLOAD;  
    <img src="/img/cloudrun/downloadEnv.jpg" width="350" />  
   <br />
   <br />
   <img src="/img/cloudrun/downloadEnvFolder.png" width="300" />

// ToDo - host this in the official Remotion repo

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

TODO: This command does not exist

```
npx remotion cloudrun policies validate
```

<hr/>

For the following steps, you may execute them on the CLI, or programmatically using the Node.JS APIs.

## 6. Deploy a service

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Deploy a service that can render videos into your GCP project by executing the following command:

```bash
npx remotion cloudrun services deploy
```

</TabItem>
<TabItem value="node">

You can deploy a service that can render videos into your GCP project using [`deployService()`](/docs/cloudrun/deployservice).

```ts twoslash
// @module: ESNext
// @target: ESNext
import { deployService } from "@remotion/cloudrun";

// ---cut---
const deployResult = await deployService({
  projectID: "my-remotion-project",
  region: "us-east1",
});
```

The object that is returned contains a name field, which you'll need for rendering.
</TabItem>
</Tabs>

The service consists of necessary binaries and JavaScript code that can take a [serve URL](/docs/terminology#serve-url) and make renders from it. A service is bound to the Remotion version, if you upgrade Remotion, you [need to deploy a new service](/docs/cloudrun/upgrading). A service does not include your Remotion code, it will be deployed in the next step instead.

A [`cloudRunUrl`](/docs/terminology#cloud-run-url) will be printed, providing unique endpoint for accessing the deployed service and performing a render.

## 7. Deploy a site

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Run the following command to deploy your Remotion project to an Cloud Storage bucket. Pass as the last argument the [entry point](/docs/terminology#entry-point) of the project.

```bash
npx remotion cloudrun sites create src/index.ts --site-name=my-video
```

A [`serveUrl`](/docs/terminology#serve-url) will be printed pointing to the deployed project.

When you update your Remotion video in the future, redeploy your site. Pass the same [`--site-name`](/docs/lambda/cli/sites#--site-name) to overwrite the previous deploy. If you don't pass [`--site-name`](/docs/lambda/cli/sites#--site-name), a unique URL will be generated on every deploy.

</TabItem>
<TabItem value="node">

First, you need to create a Cloud Storage bucket in your preferred region. If one already exists, it will be used instead:

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from "path";
import { deploySite, getOrCreateBucket } from "@remotion/cloudrun";

const { bucketName } = await getOrCreateBucket({
  region: "us-east1",
});
```

Next, upload your Remotion project to a Cloud Storage bucket. Specify the entry point of your Remotion project, this is the file where [`registerRoot()`](/docs/register-root) is called.

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from "path";
import { deploySite, getOrCreateBucket } from "@remotion/cloudrun";

const { bucketName } = await getOrCreateBucket({
  region: "us-east1",
});
// ---cut---
const { serveUrl } = await deploySite({
  bucketName,
  entryPoint: path.resolve(process.cwd(), "src/index.ts"),
  siteName: "my-video",
});
```

When you update your Remotion video in the future, redeploy your site. Pass the same [`siteName`](/docs/cloudrun/deploysite#sitename) to overwrite the previous deploy. If you don't pass [`siteName`](/docs/cloudrun/deploysite#sitename), a unique URL will be generated on every deploy.

</TabItem>
</Tabs>

## 8. Render a video or still

<Tabs
groupId="access"
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

- `<media | still>` The deployed Cloud Run service is capable of rendering media and stills. Pass either `media` or `still` to render as needed.
- `<serve-url>` The serve URL was returned during step 7, site deployment.
- `<cloud-run-url>` The Cloud Run URL was returned during step 6, service deployment.
- `<composition-id>` Pass in the [ID of the composition](/docs/composition) you'd like to render.

```bash
npx remotion cloudrun render <media | still> <serve-url> <cloud-run-url> <composition-id>
```

Progress will be printed until the video finished rendering. Congrats! You rendered your first video using Remotion Cloudrun 🚀

</TabItem>
<TabItem value="node">

<Tabs
groupId="renderType"
defaultValue="media"
values={[
{ label: 'Render Media', value: 'media', },
{ label: 'Render Still', value: 'still', },
]
}>
<TabItem value="media">

You already have the service name from a previous step. But since you only need to deploy a service once, it's useful to retrieve the name of your deployed service programmatically before rendering a video in case your Node.JS program restarts. We can call [`getServices()`](/docs/cloudrun/getservices) with the `compatibleOnly` flag to get only services with a matching version.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  // getServices,
  renderMediaOnCloudrun,
} from "@remotion/cloudrun";

// const services = await getServices({
//   region: "us-east1",
//   compatibleOnly: true,
// });

// const serviceName = services[0].serviceName;
```

We can now trigger a render of a video using the [`renderMediaOnCloudrun()`](/docs/cloudrun/renderMediaOnCloudrun) function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  // getServices,
  renderMediaOnCloudrun,
} from "@remotion/cloudrun";

const url = "string";
const cloudRunUrl = "string";
const outputBucket = "string";
const outputFile = "string";
const updateRenderProgress = (progress: number) => {};
// const services = await getServices({
//   region: "us-east1",
//   compatibleOnly: true,
// });

// const serviceName = services[0].serviceName;
// ---cut---

const { renderId, bucketName } = await renderMediaOnCloudrun({
  authenticatedRequest: false, // unauthenticated request - requires cloud run service to be public
  cloudRunUrl,
  serveUrl: url,
  composition: "HelloWorld",
  inputProps: {},
  codec: "h264",
  outputBucket,
  outputFile,
  updateRenderProgress,
});
```

The render will now run and after a while the video will be available in your cloud storage bucket. You can keep track of the render progress by passing a function to the [updateRenderProgress](/docs/cloudrun/renderMediaOnCloudrun#updateRenderProgress) attribute, to receive progress as a number.

Congrats! [Check your Cloud Storage Bucket](https://console.cloud.google.com/storage/browser) - you just rendered your first still using Remotion CloudRun 🚀
</TabItem>
<TabItem value="still">

You already have the service name from a previous step. But since you only need to deploy a service once, it's useful to retrieve the name of your deployed service programmatically before rendering a video in case your Node.JS program restarts. We can call [`getServices()`](/docs/cloudrun/getservices) with the `compatibleOnly` flag to get only services with a matching version.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  // getServices,
  renderStillOnCloudrun,
} from "@remotion/cloudrun";

// const services = await getServices({
//   region: "us-east1",
//   compatibleOnly: true,
// });

// const serviceName = services[0].serviceName;
```

We can now trigger a render of a still using the [`renderStillOnCloudrun()`](/docs/cloudrun/renderStillOnCloudrun) function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {
  // getFunctions,
  renderStillOnCloudrun,
} from "@remotion/cloudrun";

const url = "string";
const cloudRunUrl = "string";
const outputBucket = "string";
const outputFile = "string";
// const functions = await getFunctions({
//   region: "us-east-1",
//   compatibleOnly: true,
// });

// const functionName = functions[0].functionName;
// ---cut---

const { renderId, bucketName } = await renderStillOnCloudrun({
  authenticatedRequest: false, // unauthenticated request - requires cloud run service to be public
  cloudRunUrl,
  serveUrl: url,
  composition: "HelloWorld",
  inputProps: {},
  outputBucket,
  outputFile,
});
```

The render will now run and after a while the image will be available in your cloud storage bucket.

Congrats! [Check your Cloud Storage Bucket](https://console.cloud.google.com/storage/browser) - you just rendered your first still using Remotion CloudRun 🚀

</TabItem>
</Tabs>

</TabItem>
</Tabs>

## Next steps

- Select [which region(s)](/docs/lambda/region-selection) you want to run Remotion Lambda in.
- Familiarize yourself with the CLI and the Node.JS APIs (list in sidebar).
- Learn how to [upgrade Remotion Lambda](/docs/lambda/upgrading).
- Before going live, go through the [Production checklist](/docs/lambda/checklist).
- If you have any questions, go through the [FAQ](/docs/lambda/faq) or ask in our [Discord channel](https://remotion.dev/discord)
