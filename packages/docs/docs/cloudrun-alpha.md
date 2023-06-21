---
image: /generated/articles-docs-cloudrun-alpha.png
id: cloudrun-alpha
title: Cloud Run Alpha
crumb: "Version Upgrade"
---

Help us shape Remotion Cloud Run!

[Cloud Run](/docs/cloudrun) is an alternative option to [Remotion Lambda](/docs/lambda). Where Lambda offers a cloud-based rendering solution on AWS (Amazon Web Services), Cloud Run makes use of GCP (Google Cloud Platform).

## What to test

We are looking for feedback on the experience of setting up a GCP Project for Remotion Cloud Run, as well as the required components for rendering on the cloud:
- Deploy a rendering service (in Lambda, a service is known as a function).
- Deploy a Remotion project to GCP Cloud Storage (in Lambda, the storage solution is S3).
- Render a composition stored in Cloud Storage on a Cloud Run service.

We are welcoming any bug reports. See a list of [features of Cloud Run here](/blog/cloudrun).

## How to get started

You will need to use a V4.0 Remotion project, follow the [migration steps](/docs/4-0-migration.md) first if you are currently on V3.

See the [changelog](#changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```diff title="package.json"
- "remotion": "^3.3.87"
- "@remotion/bundler": "^3.3.87"
- "@remotion/eslint-config": "^3.3.87"
- "@remotion/eslint-plugin": "^3.3.87"
- "@remotion/cli": "^3.3.87"
- "@remotion/renderer": "^3.3.87"
+ "remotion": "4.1.0-alpha2"
+ "@remotion/bundler": "4.1.0-alpha2"
+ "@remotion/eslint-config": "4.1.0-alpha2"
+ "@remotion/eslint-plugin": "4.1.0-alpha2"
+ "@remotion/cli": "4.1.0-alpha2"
+ "@remotion/renderer": "4.1.0-alpha2"
```

Make sure the versions don't have a `^` character in front of it.


## Changelog

### `unreleased`
Bug fixes leading to public testing.

| Issue | Resolution   | 
|---|---|
|Rendering a still via CLI with defaults results in error - You can only pass the `quality` option if `imageFormat` is 'jpeg'. | Migrated to V4 method, using internalRenderStill() instead of renderStill(). Noticed missing options, added them in and documented. | 

### `4.1.0-alpha3`
Bug fixes leading to public testing.

| Issue | Resolution   | 
|---|---|
|When deploying a service, the image didn't exist in Google Artifact Registry. | Added publish script that runs submit.mjs, automatically deploying the image, tagged with the version number. | 
|Functions folder wasn't included in dist folder, so no CLI commandswould work. | Removed this from .npmignore, so that it is included.  |
|When using the CLI to request a render without passing a composition name, it fails to list out compositions to choose from|Issue raised, present in V4 for Lambda also.   |
|Service name structuring clips off alpha version denominator. During alpha, this will make it impossible to deploy multiple services spanning alpha versions.|Create new name formatting that meets requirements. Added tests for this.|
|CLI commands for rendering not aligned with Remotion Lambda.|`npx remotion cloudrun render media` is now `npx remotion cloudrun render`.<br /><br />`npx remotion cloudrun render still` is now `npx cloudrun remotion still`.<br /><br />Documentation also updated.|

### `4.1.0-alpha2`

Initial cloud run alpha release 🎉.
