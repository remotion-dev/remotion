---
image: /generated/articles-docs-cloudrun-cli-sites.png
id: sites
sidebar_label: sites
title: "npx remotion cloudrun sites"
slug: /cloudrun/cli/sites
crumb: "Cloud Run CLI Reference"
---

The `npx remotion cloudrun sites` command allows to create, view and delete Remotion projects in your Cloud Storage bucket.

- [`create`](#create)
- [`ls`](#ls)
- [`rm`](#rm)
- [`rmall`](#rmall)

## create

```
npx remotion cloudrun sites create src/index.ts
```

Bundle and upload a Remotion video to a Cloud Storage bucket.

The result will be a URL such as `https://storage.googleapis.com/remotioncloudrun-12345/sites/mySite123/index.html`.

:::note
If you make changes locally, you need to redeploy the site. Use [`--site-name`](#--site-name) to overwrite an existing site.
:::

You can use this "Serve URL" to render a video on Remotion Cloud Run using:

- The [`npx remotion cloudrun render media`](/docs/cloudrun/cli/render#media) and [`npx remotion cloudrun render still`](/docs/cloudrun/cli/render#still) commands
- Locally using the [`renderMedia()`](/docs/renderer/render-media) and [`renderStill()`](/docs/renderer/render-still) functions.
- Locally using the [`npx remotion render`](/docs/cli) and [`npx remotion still`](/docs/cli) commands

If you are rendering on Cloud Run, you can also pass the site Name (in this case `mySite123`) as an abbreviation.

<details>
<summary>
Example output
</summary>
<pre>
(1/3) [====================] Bundled video 3975ms<br/>
(2/3) [====================] Created bucket 457ms<br/>
(3/3) [====================] Uploaded to S3 25118ms<br/>
<br/>
Deployed to GCP Cloud Storage!<br/>
Serve URL: https://storage.googleapis.com/remotioncloudrun-12345/sites/mySite123/index.html<br/>
Site Name: mySite123<br/>
</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select. Both project and function should be in this region.

### `--site-name`

Uploads the project to a specific directory and returns a deterministic URL. If a site already existed under this name, it will be overwritten. Can only contain the following characters: `0-9`, `a-z`, `A-Z`, `-`, `!`, `_`, `.`, `*`, `'`, `(`, `)`

```
npx remotion cloudrun sites create src/index.ts --site-name=my-project
```

<details>
<summary>
Example output
</summary>
<pre>
(1/3) [====================] Bundled video 3975ms<br/>
(2/3) [====================] Created bucket 457ms<br/>
(3/3) [====================] Uploaded to S3 25118ms<br/>
<br/>
Deployed to GCP Cloud Storage!<br/>
Serve URL: https://storage.googleapis.com/remotioncloudrun-12345/sites/my-project/index.html<br/>
Site Name: my-project<br/>

</pre>
</details>

## ls

```
npx remotion cloudrun sites ls
```

Get a list of sites. The URL that is printed can be passed to the `render` command to render a video.

<details>
<summary>
Example output
</summary>
<pre>
Site Name             Bucket                        Last updated<br/>
pr6fwglz05          remotioncloudrun-abcdefg        2021-12-02<br/>     
https://storage.googleapis.com/remotioncloudrun-abcdefg/sites/pr6fwglz05/index.html<br/><br/>   
testbed             remotioncloudrun-abcdefg        2021-12-02  <br/>
https://storage.googleapis.com/remotioncloudrun-abcdefg/sites/testbed/index.html<br/>
</pre>
</details>

### `--quiet`, `-q`

Returns only a list of space-separated sites.

```
npx remotion cloudrun sites ls -q
```

<details>
<summary>
Example output
</summary>
<pre>
pr6fwglz05 testbed<br/>
</pre>
</details>

## rm

Removes a site (or multiple) from S3 by it's ID.

```bash
npx remotion cloudrun sites rm abcdef
npx remotion cloudrun sites rm abcdef my-project # multiple at once
```

<details>
<summary>
Example output
</summary>
<pre>Site abcdef in bucket remotionlambda-gc1w0xbfzl (14.7 MB): Delete? (Y/n): Y
<br/>Deleted sites/abcdef/052787b08233d85edebfc4ce4610944e.mp4
<br/>Deleted sites/abcdef/258.bundle.js
<br/>Deleted sites/abcdef/15.bundle.js
<br/>Deleted sites/abcdef/249.bundle.js.map
<br/>Deleted sites/abcdef/263.bundle.js
<br/>Deleted sites/abcdef/143.bundle.js
<br/>Deleted sites/abcdef/258.bundle.js.map
<br/>Deleted sites/abcdef/15.bundle.js.map
<br/>Deleted sites/abcdef/185.bundle.js.map
<br/>Deleted sites/abcdef/249.bundle.js
<br/>Deleted sites/abcdef/143.bundle.js.map
<br/>Deleted sites/abcdef/185.bundle.js
<br/>Deleted sites/abcdef/1f2d09019ff34eed846a5151b8561d5b.mp4
<br/>Deleted sites/abcdef/263.bundle.js.map
<br/>Deleted sites/abcdef/268.bundle.js
<br/>Deleted sites/abcdef/378.bundle.js.map
<br/>Deleted sites/abcdef/268.bundle.js.map
<br/>Deleted sites/abcdef/378.bundle.js
<br/>Deleted sites/abcdef/2b91c5234e41d3c36d4bf6df37876958.webm
<br/>Deleted sites/abcdef/450.bundle.js
<br/>Deleted sites/abcdef/46.bundle.js.map
<br/>Deleted sites/abcdef/46.bundle.js
<br/>Deleted sites/abcdef/450.bundle.js.map
<br/>Deleted sites/abcdef/534.bundle.js.map
<br/>Deleted sites/abcdef/569.bundle.js
<br/>Deleted sites/abcdef/3577958454aa99ad707b596f65151746.webm
<br/>Deleted sites/abcdef/534.bundle.js
<br/>Deleted sites/abcdef/575.bundle.js.map
<br/>Deleted sites/abcdef/575.bundle.js
<br/>Deleted sites/abcdef/569.bundle.js.map
<br/>Deleted sites/abcdef/801.bundle.js
<br/>Deleted sites/abcdef/7badbf53d3130d91b90c46181a2ecdc4.webm
<br/>Deleted sites/abcdef/801.bundle.js.map
<br/>Deleted sites/abcdef/873.bundle.js
<br/>Deleted sites/abcdef/98.bundle.js.map
<br/>Deleted sites/abcdef/bff822b868a2b87b31877f3606c9cc13.mp3
<br/>Deleted sites/abcdef/873.bundle.js.map
<br/>Deleted sites/abcdef/98.bundle.js
<br/>Deleted sites/abcdef/a2f36e3a48b4989e0da1fea9959fb35f.mp3
<br/>Deleted sites/abcdef/bundle.js
<br/>Deleted sites/abcdef/bundle.js.map
<br/>Deleted sites/abcdef/a7d87d9934059032eebb9c1536378a2a.webm
<br/>Deleted sites/abcdef/index.html
<br/>Deleted site abcdef and freed up 14.7 MB.
<br/>
</pre>
</details>

### `--region`

The [AWS region](/docs/cloudrun/region-selection) to select. Both project and function should be in this region.

### `--yes`, `-y`

Removes a site without asking for confirmation.

```
npx remotion cloudrun sites rm abcdef -y
```

### `--force-bucket-name` <AvailableFrom v="3.3.42" />

Specify a specific bucket name to be used. [This is not recommended](/docs/cloudrun/multiple-buckets), instead let Remotion discover the right bucket automatically.

## rmall

Remove all sites in the selected AWS region.

```bash
npx remotion cloudrun sites rmall
```

<details>
<summary>
Example output
</summary>
<pre>Site abcdef in bucket remotionlambda-gc1w0xbfzl (14.7 MB): Delete? (Y/n): Y
<br/>Deleted sites/abcdef/052787b08233d85edebfc4ce4610944e.mp4
<br/>Deleted sites/abcdef/258.bundle.js
<br/>Deleted sites/abcdef/15.bundle.js
<br/>Deleted sites/abcdef/249.bundle.js.map
<br/>Deleted sites/abcdef/263.bundle.js
<br/>Deleted sites/abcdef/143.bundle.js
<br/>Deleted sites/abcdef/258.bundle.js.map
<br/>Deleted sites/abcdef/15.bundle.js.map
<br/>Deleted sites/abcdef/185.bundle.js.map
<br/>Deleted sites/abcdef/249.bundle.js
<br/>Deleted sites/abcdef/143.bundle.js.map
<br/>Deleted sites/abcdef/185.bundle.js
<br/>Deleted sites/abcdef/1f2d09019ff34eed846a5151b8561d5b.mp4
<br/>Deleted sites/abcdef/263.bundle.js.map
<br/>Deleted sites/abcdef/268.bundle.js
<br/>Deleted sites/abcdef/378.bundle.js.map
<br/>Deleted sites/abcdef/268.bundle.js.map
<br/>Deleted sites/abcdef/378.bundle.js
<br/>Deleted sites/abcdef/2b91c5234e41d3c36d4bf6df37876958.webm
<br/>Deleted sites/abcdef/450.bundle.js
<br/>Deleted sites/abcdef/46.bundle.js.map
<br/>Deleted sites/abcdef/46.bundle.js
<br/>Deleted sites/abcdef/450.bundle.js.map
<br/>Deleted sites/abcdef/534.bundle.js.map
<br/>Deleted sites/abcdef/569.bundle.js
<br/>Deleted sites/abcdef/3577958454aa99ad707b596f65151746.webm
<br/>Deleted sites/abcdef/534.bundle.js
<br/>Deleted sites/abcdef/575.bundle.js.map
<br/>Deleted sites/abcdef/575.bundle.js
<br/>Deleted sites/abcdef/569.bundle.js.map
<br/>Deleted sites/abcdef/801.bundle.js
<br/>Deleted sites/abcdef/7badbf53d3130d91b90c46181a2ecdc4.webm
<br/>Deleted sites/abcdef/801.bundle.js.map
<br/>Deleted sites/abcdef/873.bundle.js
<br/>Deleted sites/abcdef/98.bundle.js.map
<br/>Deleted sites/abcdef/bff822b868a2b87b31877f3606c9cc13.mp3
<br/>Deleted sites/abcdef/873.bundle.js.map
<br/>Deleted sites/abcdef/98.bundle.js
<br/>Deleted sites/abcdef/a2f36e3a48b4989e0da1fea9959fb35f.mp3
<br/>Deleted sites/abcdef/bundle.js
<br/>Deleted sites/abcdef/bundle.js.map
<br/>Deleted sites/abcdef/a7d87d9934059032eebb9c1536378a2a.webm
<br/>Deleted sites/abcdef/index.html
<br/>Deleted site abcdef and freed up 14.7 MB.
<br/>
</pre>
</details>

### `--region`

The [AWS region](/docs/cloudrun/region-selection) to select. Both project and function should be in this region.

### `--yes`, `-y`

Removes all sites without asking for confirmation.

```
npx remotion cloudrun sites rmall -y
```

### `--force-bucket-name` <AvailableFrom v="3.3.42" />

Specify a specific bucket name to be used. [This is not recommended](/docs/cloudrun/multiple-buckets), instead let Remotion discover the right bucket automatically.
