#### Cloudshell tutorial

https://github.com/hashicorp/terraform-getting-started-gcp-cloud-shell/blob/master/tutorial/cloudshell_tutorial.md

## Permission explanations for APIs

- run.googleapis.com
  Cloud Run API
- cloudresourcemanager.googleapis.com
  Cloud Resource Manager API

## Permission explanations for Service Account role

- iam.serviceAccounts.actAs
  - When deploying, act as the default service account, which will grant further permissions required during deployment.
- run.operations.get
  - Required during deployment to confirm that deployment was successful.
- run.routes.invoke
  - Call the deployed Cloud Run services, in order to perform a render.
- run.services.create
  - Deploy new, and edit existing, Cloud Run services
- run.services.list
  - Get a list of existing Cloud Run services, to ensure no unintended overwriting.
- run.services.update
  - Update a Cloud Run service, for instance providing it with more Memory or CPU.
- storage.buckets.create
  - Create the storage bucket to store the bundled site, plus render output
- storage.buckets.get
  - ToDo...
- storage.buckets.list
  - Get a list of existing Cloud Storage resources, to ensure no unintended overwriting of storage buckets.
- storage.objects.create
  - Create new objects in storage. This could be bundled sites, or renders, or logs.
- storage.objects.delete
  - ToDo...
- storage.objects.list
  - ToDo...
- run.services.getIamPolicy
  - used to check the existing IAM policy on a service, before modifying it for (un)authenticated invoking.
- run.services.setIamPolicy
  - used to set the IAM policy on a service, to allow unauthenticated invoking, or remove unauthenticated invoking.
