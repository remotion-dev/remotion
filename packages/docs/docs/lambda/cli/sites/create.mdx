---
image: /generated/articles-docs-lambda-cli-sites-create.png
sidebar_label: create
title: 'npx remotion lambda sites create'
slug: /lambda/cli/sites/create
crumb: 'Lambda CLI Reference'
---

```
npx remotion lambda sites create <entry-point>?
```

You may pass an [entry point](/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](/docs/terminology/entry-point#which-entry-point-is-being-used).

Bundle and upload a Remotion video to an S3 bucket.

The result will be a URL such as `https://remotionlambda-12345.s3.eu-central-1.amazonaws.com/sites/abcdef/index.html`.

:::note
If you make changes locally, you need to redeploy the site. Use [`--site-name`](#--site-name) to overwrite an existing site.
:::

You can use this "Serve URL" to render a video on Remotion Lambda using:

- The [`npx remotion lambda render`](/docs/lambda/cli/render) and [`npx remotion lambda still`](/docs/lambda/cli/still) commands
- The [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) and [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda) functions.
- Locally using the [`renderMedia()`](/docs/renderer/render-media) and [`renderStill()`](/docs/renderer/render-still) functions.
- Locally using the [`npx remotion render`](/docs/cli) and [`npx remotion still`](/docs/cli) commands

If you are rendering on Lambda, you can also pass the site Name (in this case `abcdef`) as an abbreviation.

<details>
  <summary>Example output</summary>
  <pre>
    (1/3) [====================] Bundled video 3975ms
    <br />
    (2/3) [====================] Created bucket 457ms
    <br />
    (3/3) [====================] Uploaded to S3 25118ms
    <br />
    <br />
    Deployed to S3!
    <br />
    Serve URL: https://remotionlambda-12345.s3.eu-central-1.amazonaws.com/sites/abcdef/index.html
    <br />
    Site Name: abcdef
    <br />
  </pre>
</details>

## `--region`

The [AWS region](/docs/lambda/region-selection) to select. Both project and function should be in this region.

## `--site-name`

Uploads the project to a specific directory and returns a deterministic URL. If a site already existed under this name, it will be overwritten. Can only contain the following characters: `0-9`, `a-z`, `A-Z`, `-`, `!`, `_`, `.`, `*`, `'`, `(`, `)`

```
npx remotion lambda sites create src/index.ts --site-name=my-project
```

## `--force-bucket-name`<AvailableFrom v="3.3.42" />

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

## `--privacy`<AvailableFrom v="3.3.97" />

Either `public` (default) or `no-acl` if you are not using ACL. Sites must have a public URL to be able to be rendered on Lambda, since the headless browser opens that URL.

## `--public-dir`<AvailableFrom v="4.0.140" />

<Options id="public-dir" />

## `--enable-folder-expiry`<AvailableFrom v="4.0.32" />

<Options id="enable-folder-expiry" />

## `--throw-if-site-exists`<AvailableFrom v="4.0.141"/>

<Options id="throw-if-site-exists" />

## `--disable-git-source`<AvailableFrom v="4.0.182" />

<Options id="disable-git-source" />

## `--force-path-style`<AvailableFrom v="4.0.202" />

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.
