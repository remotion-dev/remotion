from the root, `pnpm i && pnpm build` will trigger a build command for all packages. For the GCP package, this will bundle the required code into `gcp/container`.

The /container folder contains a package.json that lists functions-framework as a dependency, and a Dockerfile that will build the container. Functions-framework is a nodejs framework that allows you to run nodejs code in a containerized environment.

This can be built and deployed to Cloud Run. Cloud Run is a serverless container platform that allows you to run containers in a managed environment.

### Push images to Google Container Registry
To start, you need to create a project in the Google Cloud Console, and create a repository in the Google Container Registry, and push the container to the registry using;
`gcloud builds submit --tag australia-southeast1-docker.pkg.dev/remotion-lambda/repo1/render-on-cloud-run:0.1.0`

### Deploy to Cloud Run
Navigate to Cloud Run, and click "Create Service". Select "Container Registry", and select the image you just pushed. You can select `Allow unauthenticated invocations` to ignore security for now. Click "Create".
To update the image running on Cloud Run, you can click "Edit & Deploy new revision" and select the new image.

### Run the services
Within the Cloud Run service, you can see the URL of the service. You can run the service by sending a POST request to the URL with the following body example:

#### Body to render media:
```
{
    "type": "media",
    "composition": "HelloWorld",
    "serveUrl": "https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html",
    "codec": "h264",
    "inputProps": {
      "titleText": "Welcome to Remotion",
      "titleColor": "black"
    },
    "outputBucket": "remotionlambda-test",
    "outputFile": "outFolder/mediaOutput.mp4"
}
```
#### Body to render still:
```
{
    "composition": "StillRender",
    "serveUrl": "https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html",
    "inputProps": {
      "text": "Created on Cloud Run™️"
    },
    "outputBucket": "remotionlambda-test",
    "outputFile": "outFolder/stillOutput.png"
}
```


### NEXT STEPS
> let's work towards making user facing APIs for deploying the container and invoke it.
> aka make equivalent functions for deployFunction() and renderMediaOnLambda()
> as far as I understand it right now, one would have to clone the monorepo to deploy it

Add firestore option for storing progress
https://www.remotion.dev/docs/renderer/render-media#onprogress

# To investigate
How can people get the :latest version from artifact registry?
How to program a CLI command that will deploy the container to Cloud Run?

## Created public artifact repo in GCP
Public artifact registry that contains the container images
  us-docker.pkg.dev/remotion-dev/cloud-run/render
Image is tagged with the same semver as the remotion packages
  us-docker.pkg.dev/remotion-dev/cloud-run/render:3.3.36-alpha
Part of the CI/CD pipeline should be to push a new container image to the artifact registry, with the right version:
`gcloud builds submit --tag us-docker.pkg.dev/remotion-dev/cloud-run/render:${version}`

## deployCloudRun()
