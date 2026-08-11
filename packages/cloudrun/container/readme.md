# Creation of container image for Cloud Run

The build command at the root of the gcp package has two purposes

1. Bundle the logic for the GCP package for CLI / Node commands
2. Bundle the logic to be used in a Docker image for rendering on Cloud Run

The rendering logic bundle is placed within this `./container` folder, and the Dockerfile copies it over when creating the image.
The Dockerfile also bundles chromium and ffmpeg, and installs the [functions-framework package](https://cloud.google.com/functions/docs/functions-framework) in order to execute the Node code in a Cloud Run environment.

## GCP Artifact Registry

The Artifact Registry in GCP is a place to store container images. The Remotion-dev project has been created in GCP as a central place to host a public registry which can be read from by anyone. In particular, it is read from in the [Remotion GCP API when deploying a new Cloud Run instance](../src/api/deploy-new-cloud-run.ts).

There are two folders in the registry, production and development. When uploading a new image using `node submit.mjs`, you need to pass `ARTIFACT_REGISTRY_ENV=development` or `ARTIFACT_REGISTRY_ENV=production` as detailed in the upload steps below.

The image that is retrieved is located at `us-docker.pkg.dev/remotion-dev/<production | development>/render:${remotionVersion}` where remotionVersion is a prop that gets passed in. Therefore, whenever a new version of Remotion is released, a new image needs to be added to the Artifact Registry that makes use of the latest Remotion Package. The images are tagged with the Remotion version, so that people can get the required version for their environment.

If deploying a development image to cloud run, you will need to choose it manually from within the GCP console. The Container image url will be `us-docker.pkg.dev/remotion-dev/development/render:${remotionVersion}`. Alternatively, `src/shared/validate-image-remotion-version.ts` and `src/api/helpers/construct-service-deploy-request.ts` will need to be edited to use the development folder. Perhaps in the future this can check a .env variable.

## Upload to Artifact Registry

Complete a build for the GCP package, so that `cloudrun/container` contains an up-to-date `dist` folder.

1. Install the GCloud CLI - [Link](https://cloud.google.com/sdk/docs/install)
2. Init GCloud CLI by running `gcloud init`  
   a. This will launch a browser for you to authenticate your shell with Google Cloud  
   b. Within the shell, you should see remotion-dev as a project to use. Select this  
   c. Typing `gcloud config list` should show that the correct account and project are active
   d. if remotion-dev is not the current project, run `gcloud config set project remotion-dev`
3. `cd` into the `packages/cloudrun/container` folder.
4. Run `node submit.mjs`
   a. To upload into the development repository, use `ARTIFACT_REGISTRY_ENV=development node submit.mjs`
   a. To upload into the production repository, use `ARTIFACT_REGISTRY_ENV=production node submit.mjs`. This is what is used by the publish action in `package.json` .
5. Navigate to [Artifact Registry](https://console.cloud.google.com/artifacts/docker/remotion-dev/us/production/render?project=remotion-dev) to see the new image, with the correct tag.
