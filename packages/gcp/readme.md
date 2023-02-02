from the root, `pnpm i && pnpm build` will trigger a build command for all packages. For the GCP package, this will bundle the required code into `containers/renderStill` and `containers/renderMedia`.

Each /container folder contains a package.json that lists functions-framework as a dependency, and a Dockerfile that will build the container. Functions-framework is a nodejs framework that allows you to run nodejs code in a containerized environment.

This can be build and deployed to Cloud Run. Cloud Run is a serverless container platform that allows you to run containers in a managed environment.

### Push images to Google Container Registry
To start, you need to create a project in the Google Cloud Console, and create a repository in the Google Container Registry, and push the container to the registry using
for renderStill:
`gcloud builds submit --tag australia-southeast1-docker.pkg.dev/remotion-lambda/repo1/render-still:0.1.0`
for renderMedia:
`gcloud builds submit --tag australia-southeast1-docker.pkg.dev/remotion-lambda/repo1/render-media:0.1.0`

### Deploy to Cloud Run
Navigate to Cloud Run, and click "Create Service". Select "Container Registry", and select the image you just pushed. You can select `Allow unauthenticated invocations` to ignore security for now. Click "Create".
To update the image running on Cloud Run, you can click "Edit & Deploy new revision" and select the new image.


### Run the services
Within the Cloud Run service, you can see the URL of the service. You can run the service by sending a POST request to the URL with the following body example:

#### Render Media Body:
```
{
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
#### Render Still Body:
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