# Creation of container image for Cloud Run

The build command at the root of the gcp package has two purposes

1. Bundle the logic for the GCP package for CLI / Node commands
2. Bundle the logic to be used in a Docker image for rendering on Cloud Run

The rendering logic bundle is placed within this `./container` folder, and the Dockerfile copies it over when creating the image.
The Dockerfile also bundles chromium and ffmpeg, and installs the [functions-framework package](https://cloud.google.com/functions/docs/functions-framework) in order to execute the Node code in a Cloud Run environment.

## GCP Artifact Registry

The Artifact Regsitry in GCP is a place to store container images. The Remotion-dev project has been created in GCP as a central place to host a public registry which can be read from by anyone. In particular, it is read from in the [Remotion GCP API when deploying a new Cloud Run instance](../src/api/deploy-new-cloud-run.ts). The image that is retrieved is located at `us-docker.pkg.dev/remotion-dev/cloud-run/render:${remotionVersion}` where remotionVersion is a prop that gets passed in. Therefore, whenever a new version of Remotion is released, a new image needs to be added to the Artifact Registry that makes use of the latest Remotion Package. The images are tagged with the Remotion version, so that people can get the required version for their environment.

## Build Pipeline

A Github Action Workflow has been created under the file `deploy-gcp-artifact.yml`. It authenticates with GCP using a service account in the remotion-dev project (github-action@remotion-dev.iam.gserviceaccount.com) using a workload identity pool. The service account has write permissions on the Artifact Registry repository that contains Cloud Run images. The workflow logs in to Artifact Registry, and uploads a new image, tagging it with the latest Release tag from GitHub, as well as tagging it with 'latest'. Subsequent images will take the 'lastest' tags for themselves, and only one image will have this tag at a time. This workflow will only run when a Release is published or edited in GitHub.

### Steps taken to allow Github Action to work with GCP

This pipeline should work as is, but the steps are recorded here for future troubleshooting if necessary.

1. Created a new service account, called github-action, whose purpose is to run the github action.
   ```
   gcloud iam service-accounts create github-action \
    --project remotion-dev
   ```
2. Enabled IAM API in the project

   ```
   gcloud services enable iamcredentials.googleapis.com \
   --project remotion-dev
   ```

3. Created a workload identity pool called github-id-pool

   ```
   gcloud iam workload-identity-pools create github-id-pool \
      --project=remotion-dev \
   --location="global" \
   --display-name=github-id-pool

   ```

4. Received a unique identifier for this pool

   ```
   gcloud iam workload-identity-pools describe github-id-pool \
      --project=remotion-dev \
   --location="global" \
   --format="value(name)"

   ```

5. Created a provider within the pool for github to access

   ```
   gcloud iam workload-identity-pools providers create-oidc github-provider \
      --project=remotion-dev \
      --location="global" \
      --workload-identity-pool=github-id-pool \
      --display-name=github-provider \
      --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
      --issuer-uri="https://token.actions.githubusercontent.com"
   ```

6. Allow the GitHub Action based in the remotion repository to login to the service account via the provider.

   ```
   gcloud iam service-accounts add-iam-policy-binding "github-action@remotion-dev.iam.gserviceaccount.com" \
      --project=remotion-dev \
      --role="roles/iam.workloadIdentityUser" \
      --member="principalSet://iam.googleapis.com/projects/1079363441639/locations/global/workloadIdentityPools/github-id-pool/attribute.repository/remotion-dev/remotion"
   ```

   **Note for Jonny: For now I have also given access to my personal repo**

7. This command returns the identifier of that provider

   ```
   gcloud iam workload-identity-pools providers describe github-provider \
      --project=remotion-dev \
      --location="global" \
      --workload-identity-pool=github-id-pool \
      --format="value(name)"
   ```

8. Allow the newly created Service Account to access the Artifact Registry in the remotion-dev project

   ```
   gcloud projects add-iam-policy-binding remotion-dev \
      --member="serviceAccount:github-action@remotion-dev.iam.gserviceaccount.com" \
      --role="roles/artifactregistry.writer"
   ```

## Backup - Manual Upload to Artifact Registry

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
