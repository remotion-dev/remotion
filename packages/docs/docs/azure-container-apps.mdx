---
image: /generated/articles-docs-azure-container-apps.png
title: 'Deploying to Azure Container Apps'
sidebar_label: 'Azure Container Apps'
crumb: 'Server-side rendering'
---

:::note
This guide has been contributed by the community and has not yet been tested by the Remotion team.
:::

This guide provides a walkthrough for deploying Remotion rendering service with basic render queuing on [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps).

## Prerequisites

- A working Remotion project (e.g., from `npm create video`) with provision to use [Docker](https://www.docker.com/).
- An [Azure account](https://azure.microsoft.com/en-au/pricing/purchase-options/azure-account).
- A basic understanding of [Docker](https://www.docker.com/) and having it installed on your system is required.
- The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/?view=azure-cli-latest) installed, authenticated (`azure login`) and a subscription is selected after authentication.
- The Azure account is provisioned to use GPU on `Azure Container Apps`, if not, request [here](https://aka.ms/aca/gpus-request-access).
- A [docker hub account](https://www.docker.com/get-started/) to host the docker image and authenticate (`docker login`).

## Step 1: Pick a project

For simplicity, we'll use [remotion-gpu](https://github.com/alexfernandez803/remotion-azure) which is configured to leverage GPU acceleration. This project is based with [Remotion render server template](https://github.com/remotion-dev/template-render-server) and uses the [scene](https://github.com/remotion-dev/gpu-scene/blob/main/src/Root.tsx#L23) composition from [gpu-scene](https://github.com/remotion-dev/gpu-scene) project.

## Step 2: Build and tag the docker image

From the project directory, build the Docker image and push it to Docker Hub with your account, specifying an image name and version tag. The `image-name` is `remotion-docker-gpu` and `version` is `1.0.0`.

```bash
docker build -t your-dockerhub-username/remotion-docker-gpu:1.0.0 .
```

## Step 3: Push the image to docker hub

```bash
docker push your-dockerhub-username/remotion-docker-gpu:1.0.0
```

## Step 4: Set environment variables

Set the environment variables for the `azure cli`

```bash title="Set environment variables"
CONTAINER_IMAGE="docker.io/your-dockerhub-username/remotion-docker-gpu:1.0.0"
RESOURCE_GROUP="<RESOURCE_GROUP>"
ENVIRONMENT_NAME="<ENVIRONMENT_NAME>"
LOCATION="swedencentral"
CONTAINER_APP_NAME="<CONTAINER_APP_NAME>"
WORKLOAD_PROFILE_NAME="NC8as-T4"
WORKLOAD_PROFILE_TYPE="Consumption-GPU-NC8as-T4"
```

### Variable representation

- `CONTAINER_IMAGE` represents the `docker.io` domain and docker image.
- `LOCATION` represents the region where the GPU is allocated.
- `WORKLOAD_PROFILE_NAME` and `WORKLOAD_PROFILE_TYPE` are constant variables from Azure [documentation](https://learn.microsoft.com/en-us/azure/container-apps/gpu-image-generation?pivots=azure-cli) representing GPU family to use.

## Step 5: Create the resource group

```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --query "properties.provisioningState"
```

## Step 6: Register insights for monitoring

```bash
az provider register -n Microsoft.OperationalInsights --wait

```

## Step 7: Create a Container Apps environment

```bash
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --query "properties.provisioningState"
```

## Step 8: Add a workload profile to your environment

```bash
az containerapp env workload-profile add \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workload-profile-name $WORKLOAD_PROFILE_NAME \
  --workload-profile-type $WORKLOAD_PROFILE_TYPE
```

## Step 9: Deploy container app

```bash
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $CONTAINER_IMAGE \
  --target-port 3000 \
  --ingress external \
  --cpu 8.0 \
  --memory 56.0Gi \
  --workload-profile-name $WORKLOAD_PROFILE_NAME \
  --query properties.configuration.ingress.fqdn
```

`Azure CLI` will deploy the image to `Azure Container Apps` and when completed will provide a URL which accepts `HTTP` requests.

```bash title="Deployment Output (example)"
Container app created. Access your app at https://remotion-gpu.grayocean-24741fc9.australiaeast.azurecontainerapps.io/
"remotion-gpu.grayocean-24741fc9.australiaeast.azurecontainerapps.io"
```

:::note
The `target-port` is the `port` that the `Node.js` server listens on for incoming requests. Steps 4 to 9 are based on the [Azure Container App](https://learn.microsoft.com/en-us/azure/container-apps/gpu-image-generation?pivots=azure-cli) documentation.
:::

## Step 10: Trigger a Render

Send a POST request to the service's /renders endpoint. Replace `YOUR_SERVICE_URL` with the URL from the deployment output, `https://remotion-gpu.grayocean-24741fc9.australiaeast.azurecontainerapps.io/`.

```bash
curl -X POST {YOUR_SERVICE_URL}/renders \
-H "Content-Type: application/json" \
-d '{}'
```

### Response

If successful, the API will respond with `JSON` containing the `jobId` which can be used to get the status of render.

```json title="Example Response"
{
  "jobId": "955338f6-2607-48bd-bedb-6d4c98f7b4dc"
}
```

## Step 11: Get render status

Send a GET request to get the render status, replace `YOUR_SERVICE_URL` with the URL from the deployment output and the `jobId` from the render request output.

```bash
curl  {YOUR_SERVICE_URL}/renders/{jobId}
```

### Response

```json title="Example Response"
{
  "status": "completed",
  "videoUrl": "/renders/955338f6-2607-48bd-bedb-6d4c98f7b4dc.mp4",
  "data": {"titleText": "Hello, world!"}
}
```

If `status` is `completed`, combine `YOUR_SERVICE_URL` and the `videoUrl` response to generate the download link (`https://remotion-gpu.grayocean-24741fc9.australiaeast.azurecontainerapps.io/renders/955338f6-2607-48bd-bedb-6d4c98f7b4dc.mp4`).

## Step 12: (`Optional`) Delete the resource group

```bash
az group delete --name $RESOURCE_GROUP
```

This will delete all the resources inside the resource group including the application container.

:::warning
Cost: This implementation does not include cost management. Refer to Azure pricing documentation for usage estimates. Use at your own risk.
Performance: Generated videos may appear blurry. GPU acceleration is configured in the project [config](https://github.com/alexfernandez803/remotion-azure/blob/main/remotion.config.ts#L6), but actual GPU utilization has not been confirmed.
:::

## See also

- [Cloudflare Containers](/docs/cloudflare-containers)
