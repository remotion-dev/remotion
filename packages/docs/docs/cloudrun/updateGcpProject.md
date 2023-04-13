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

3. Within the Cloud Shell, type the following command, and select option 2. Follow the remaining prompts.

   ```bash
   curl --remote-name-all https://raw.githubusercontent.com/UmungoBungo/remotion/gcp-lambda-alternative/packages/cloudrun/{terraform/main.tf,install.mjs} && node install.mjs
   ```

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
