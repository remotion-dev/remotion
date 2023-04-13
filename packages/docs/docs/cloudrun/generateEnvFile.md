---
image: /generated/articles-docs-cloudrun-generateEnvFile.png
id: generateEnvFile
title: Generate .env File
slug: /cloudrun/generateEnvFile
crumb: "Cloudrun"
---

As GCP Cloud Shell has access to the project, a script can be run to generate a .env file with the required Service Account keys and Project ID. As Cloud Shell makes use of the logged-in user's credentials for permissions in the project, it is assumed you have the owner role on the project. If you were the one that created the project, you will be an owner.

It is important to have strict control over the service account keys, as they are used to authenticate the Remotion project to GCP. The .env file should not be committed to source control, and not shared with anyone. Any time you no longer require a service account key, it should be deleted.

GCP allows a maximum of 10 keys per service account. If you have already created 10 keys, you will need to delete one before you can create another. The following script provides you with an opportunity to do this from within the terminal.

1. Open the [Project Dashboard](https://console.cloud.google.com/home/dashboard) in the GCP console, and select your existing Remotion project.

2. In the top right hand corner of the screen, click the Activate Cloud Shell icon

   <img src="/img/cloudrun/selectCloudShell.jpg" width="200" />

3. Within the Cloud Shell, type the following command, and select option 3. Follow the remaining prompts.

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
