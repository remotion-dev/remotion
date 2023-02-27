# Creation of container image for Cloud Run

The build command at the root of the gcp package has two purposes

1. Bundle the logic for the GCP package for CLI / Node commands
2. Bundle the logic to be used in a Docker image for rendering on Cloud Run

The rendering logic bundle is placed within this `./container` folder, and the Dockerfile copies it over when creating the image.
The Dockerfile also bundles chromium and ffmpeg, and installs the [functions-framework package](https://cloud.google.com/functions/docs/functions-framework) in order to execute the Node code in a Cloud Run environment.

## GCP Artifact Registry

The Artifact Regsitry in GCP is a place to store container images. The Remotion-dev project has been created in GCP as a central place to host a public registry which can be read from by anyone. In particular, it is read from in the [Remotion GCP API when deploying a new Cloud Run instance](../src/api/deploy-new-cloud-run.ts). The image that is retrieved is located at `us-docker.pkg.dev/remotion-dev/cloud-run/render:${remotionVersion}` where remotionVersion is a prop that gets passed in. Therefore, whenever a new version of Remotion is released, a new image needs to be added to the Artifact Registry that makes use of the latest Remotion Package. The images are tagged with the Remotion version, so that people can get the required version for their environment.

## [For now] Manual Upload to Artifact Registry

Complete a build for the GCP package, so that `gcp/container` contains an up-to-date `dist` folder.

1. Install the GCloud CLI - [Link](https://cloud.google.com/sdk/docs/install)
2. Init GCloud CLI by running `gcloud init`  
   a. This will launch a browser for you to authenticate your shell with Google Cloud  
   b. Within the shell, you should see remotion-dev as a project to use. Select this  
   c. Typing `gcloud config list` should show that the correct account and project are active
3. `cd` into the `packages/gcp/container` folder.
4. Run `gcloud builds submit --tag us-docker.pkg.dev/remotion-dev/cloud-run/render:VERSION` replacing
   VERSION with the current Remotion version.
5. Navigate to [Artifact Registry](https://console.cloud.google.com/artifacts/docker/remotion-dev/us/cloud-run/render?project=remotion-dev) to see the new image, with the correct tag.

## [Future] Build Pipeline

The github build pipeline will need to be edited to build the Dockerfile, tag it with the version number and upload it to Google Artifact Registry. [This looks like a good starting point](https://gist.github.com/palewire/12c4b2b974ef735d22da7493cf7f4d37)
