---
image: /generated/articles-docs-cloudrun-alpha.png
id: cloudrun-alpha
title: Cloud Run Alpha
crumb: "Version Upgrade"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Help us shape Remotion Cloud Run!

[Cloud Run](/docs/cloudrun) is an alternative option to [Remotion Lambda](/docs/lambda). Where Lambda offers a cloud-based rendering solution on AWS (Amazon Web Services), Cloud Run makes use of GCP (Google Cloud Platform).

## What to test

We are looking for feedback on the experience of setting up a GCP Project for Remotion Cloud Run, as well as the required components for rendering on the cloud:

- Deploy a rendering service (in Lambda, a service is known as a function).
- Deploy a Remotion project to GCP Cloud Storage (in Lambda, the storage solution is S3).
- Render a composition stored in Cloud Storage on a Cloud Run service.

We are welcoming any [bug reports](https://remotion.dev/issue).

## 1. Install `@remotion/cloudrun`

<Installation pkg="@remotion/cloudrun"/>

From `v4.0.18`, Cloud run is distributed together with the main release of Remotion. Before that, you had to install the alpha release (see below).

## Changelog (moved)

From `4.0.18` on, see changes [here](https://remotion.dev/changelog).

### `4.0.18`

Remotion Cloud Run is now distributed together with the main release of Remotion. You no longer need to switch to the alpha release, although Remotion Cloud Run is still alpha software. **The changelog is [now part of the main changelog](https://remotion.dev/changelog)**.

### `4.1.0-alpha12`

Includes features and bugfixes from `v4.0.17`.
Includes a fix for streaming progress sometimes throwing an exception.

### `4.1.0-alpha11`

Includes bugfixes from `v4.0.12`.

### `4.1.0-alpha9`

#### Known issues

- any internal errors created by Remotion from within the service are not currently sent back in the error response to the renderMediaOnCloudrun and renderStillOnCloudrun APIs (these APIs are also used within the CLI). For these errors, users will need to check the logs for now.

#### Improvements

- Artifact registry, used to store versioned images for deploying services, now has two folders - production and development.
- Provide helpful response when Cloud Run crashes during render.
  - CLI alerts user there was a crash, fetches logs, determines if cause was likely memory or timeout issue.
  - API can receive a success or crash response
  - New response documented
- Default concurrency for rendering media is now 100%. This will set the concurrency equal to the number of cores the deployed service has.

### `4.1.0-alpha5`

- Fix input props not working for dynamic metadata
- Apply changes from `4.0.0-alpha20`.

### `4.1.0-alpha4`

Fixed schema error when invoking a render.

Bug fixes leading to public testing.

| Issue                                                                                                                         | Resolution                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Rendering a still via CLI with defaults results in error - You can only pass the `quality` option if `imageFormat` is 'jpeg'. | Migrated to V4 method, using internalRenderStill() instead of renderStill(). Noticed missing options, added them in and documented. |

### `4.1.0-alpha3`

Bug fixes leading to public testing.

| Issue                                                                                                                                                         | Resolution                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| When deploying a service, the image didn't exist in Google Artifact Registry.                                                                                 | Added publish script that runs submit.mjs, automatically deploying the image, tagged with the version number.                                                                                            |
| Functions folder wasn't included in dist folder, so no CLI commandswould work.                                                                                | Removed this from .npmignore, so that it is included.                                                                                                                                                    |
| When using the CLI to request a render without passing a composition name, it fails to list out compositions to choose from                                   | Issue raised, present in V4 for Lambda also.                                                                                                                                                             |
| Service name structuring clips off alpha version denominator. During alpha, this will make it impossible to deploy multiple services spanning alpha versions. | Create new name formatting that meets requirements. Added tests for this.                                                                                                                                |
| CLI commands for rendering not aligned with Remotion Lambda.                                                                                                  | `npx remotion cloudrun render media` is now `npx remotion cloudrun render`.<br /><br />`npx remotion cloudrun render still` is now `npx cloudrun remotion still`.<br /><br />Documentation also updated. |

### `4.1.0-alpha2`

Initial cloud run alpha release 🎉.
