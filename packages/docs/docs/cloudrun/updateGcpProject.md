---
image: /generated/articles-docs-cloudrun-updateGcpProject.png
id: updateGcpProject
title: Update GCP Project
slug: /cloudrun/updateGcpProject
crumb: "Cloudrun"
---

The permissions on the Service Account role may change as Remotion evolves in the future. To ensure that the permissions in GCP match the requirements of the version of your Remotion project, follow these steps;

1. Open the [Project Dashboard](https://console.cloud.google.com/home/dashboard) in the GCP console, and select your existing Remotion project.

2. In the top right hand corner of the screen, click the Activate Cloud Shell icon

   <img src="/img/cloudrun/selectCloudShell.jpg" width="200" />

3. Within the Cloud Shell, type the following command and follow the prompts.

   ```bash
   curl -L https://raw.githubusercontent.com/UmungoBungo/remotion/gcp-lambda-alternative/packages/cloudrun/gcpInstaller/gcpInstaller.tar | tar -x --strip-components=1 -C . && node install.mjs
   ```

   _The first command downloads a tar file from the Remotion repo, and extracts it to the current directory. The second command runs the installer script._

   If you are updating the version of Remotion for this GCP project, you will want to select option 2.

   If this is the first time [initialising Remotion in the GCP project](./setup.md), you will want to select option 1.  
   If you want to [generate a new .env file](./generateEnvFile.md), or manage keys already created, you will want to select option 3.
   <!-- ToDo - host this in the official Remotion repo -->

4. Download the .env file by clicking the vertical ellipsis, in the top right of the cloud shell window, and selecting Download. Then type .env at the end of the prefilled path, and click DOWNLOAD;  
    <img src="/img/cloudrun/downloadEnv.jpg" width="350" />  
   <br />
   <br />
   <img src="/img/cloudrun/downloadEnvFolder.png" width="300" />

5. Remove the .env file from the virtual machine, using this command;

   ```bash
   rm .env
   ```

6. Place the downloaded .env file into the root of the Remotion project. You may need to rename it from `env.txt`, to `.env`. The file should have this format;

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
