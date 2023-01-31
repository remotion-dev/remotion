`pnpm run buildlambda` will trigger a build command, which will bundle all the required code into one index.js file, and place it in `./container/dist/index.js`.


the `/container` folder contains a package.json that lists functions-framework as a dependency, and a Dockerfile that will build a container. Functions-framework is a nodejs framework that allows you to run nodejs code in a containerized environment.

This container can be built and run locally, using
`docker build -t umungobungo/gcp-bundle-0.0.3 .`

Or, it can be deployed to Cloud Run. Cloud Run is a serverless container platform that allows you to run containers in a managed environment.

### Push image to Google Container Registry
To start, you need to create a project in the Google Cloud Console, and create a repository in the Google Container Registry, and push the container to the registry using
`gcloud builds submit --tag australia-southeast1-docker.pkg.dev/remotion-lambda/repo1/docker:0.0.1`

### Deploy to Cloud Run
Navigate to Cloud Run, and click "Create Service". Select "Container Registry", and select the image you just pushed. You can select `Allow unauthenticated invocations` to ignore security for now. Click "Create".
