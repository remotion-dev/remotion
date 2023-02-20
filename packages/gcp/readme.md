from the root, `pnpm i && pnpm build` will trigger a build command for all packages. For the GCP package, this will bundle the required code into `gcp/container`.

The /container folder contains a package.json that lists functions-framework as a dependency, and a Dockerfile that will build the container. Functions-framework is a nodejs framework that allows you to run nodejs code in a containerized environment.

This can be built and deployed to Cloud Run. Cloud Run is a serverless container platform that allows you to run containers in a managed environment.


## Deploying new artifact repo in GCP for new Remotion versions
Public artifact registry that contains the container images
  us-docker.pkg.dev/remotion-dev/cloud-run/render
Image is tagged with the same semver as the remotion packages
  us-docker.pkg.dev/remotion-dev/cloud-run/render:3.3.36-alpha
Part of the CI/CD pipeline should be to push a new container image to the artifact registry, with the right version:
`gcloud builds submit --tag us-docker.pkg.dev/remotion-dev/cloud-run/render:${version}`



# How to use the GCP CLI commands
### 1. Create a project in the Google Cloud Console  
Navigate to the [Manage Resources](https://console.cloud.google.com/cloud-resource-manager?walkthrough_id=resource-manager--create-project&start_index=1#step_index=1) screen in Google Cloud Console.  
- On the Select organization drop-down list at the top of the page, select the organization resource in which you want to create a project. If you are a free trial user, skip this step, as this list does not appear.  
- Click Create Project.  
- In the New Project window that appears, enter a project name and select a billing account as applicable. A project name can contain only letters, numbers, single quotes, hyphens, spaces, or exclamation points, and must be between 4 and 30 characters.  
- Enter the parent organization or folder resource in the Location box. That resource will be the hierarchical parent of the new project. If No organization is an option, you can select it to create your new project as the top level of its own resource hierarchy.  
- When you're finished entering new project details, click Create.

### 2. Create a service account in the Google Cloud Console  
Navigate to the [Service Accounts](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts/create) screen in Google Cloud Console, within IAM.  
- Select the Cloud project created in the previous step.
- Enter a service account name to display in the Google Cloud console.
- The Google Cloud console generates a service account ID based on this name. Edit the ID if necessary. You cannot change the ID later.
- Optional: Enter a description of the service account.  
- Click 'Create and continue' and continue to the next step.
- Give the Service Account the Owner role. Note - this grants full admin rights and should be refined before the GCP option is live.  
![Grant editor role to service account](readmeImages/createSA.png "Grant editor role to service account")
- Click Done to finish creating the service account.  

### 3. Save a key for the Service Account  
- Navigate to the [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) screen in Google Cloud Console, within IAM.  
- Select the Cloud project created in the previous step.
- Click on the ellipsis under 'Actions', in the final column, and click 'Manage keys'.  
- On the next screen, click ADD KEY, and then Create new key.
- select JSON, and click Create.
- Save the JSON file to your computer, with the filename `sa-key.json`.
- Place the key in the root of the Remotion project you wish to deploy to GCP. For now, this will have to be somewhere that `npx remotion gcp ...` is able to run, as this package is not deploy to npm yet.  

### 3. Enable required APIs in the project
- Enable the Cloud Run API. Navigate to the [Cloud Run API](https://console.cloud.google.com/apis/library/run.googleapis.com) screen in Google Cloud Console, and click ENABLE. Make sure the correct project is selected in the dropdown in the top left.

# Available commands from the CLI:
This command will deploy a cloud-run service, and return the URL of the service. This cloud run service is what will be invoked to render media.  
## Command: `npx remotion gcp cloud-run deploy`  
Options:  
-  --project-id (required): 
    - The project-id is the name of the project in which to deploy the service. The ID can be retrieved by navigating to the [Dashboard](https://console.cloud.google.com/home/dashboard?project=new-remotion-project&supportedpurview=project) screen in Google Cloud Console, and selecting the project from the drop-down menu in the top left corner. The ID is under Project Info in the top left corner.
-  --service-name (required):
    - the name of the Cloud Run service to deploy or update. Service names must be 49 characters or less and must be unique per region and project. A service name cannot be changed later and is publicly visible. The service does not need to exist yet. If it does exist, a new revision will be deployed.
-  --region: the region of the service
-  --remotion-version (required for now): the version of the remotion package to use
    - the version of Remotion to deploy on the service. Behind the scenes, this is selecting the container image from a publicly readable repository `us-docker.pkg.dev/remotion-dev/cloud-run/render`. Part of the build step for the monorepo will be to deploy a new container image to this repository, with the remotion version as a tag.
    - for now, the remotion version must be set to `3.3.36-alpha`
-  --allow-unauthenticated (optional, default to false):
    - whether to allow unauthenticated requests to the service. For now, I would suggest setting this to true, to avoid having to create a service account and grant it access to the service. In the future, it would be recommended to not set this tru.
-  --overwrite-service (optional, default to false):
    - if an existing service is found with the same name, a prompt will come up asking if a new revision should be deployed. If this flag is set to true, the prompt will be skipped and a new revision will be deployed automatically.

Taking the above into account, a valid command would be:  
`npx remotion gcp cloud-run deploy --service-name=cloud-run-render --project-id=new-remotion-project --remotion-version=3.3.36-alpha --allow-unauthenticated`

## Command: `npx remotion gcp sites create`
t.b.c

### Render media on GCP
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