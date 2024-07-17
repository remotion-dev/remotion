---
image: /generated/articles-docs-cloudrun-upgrading.png
id: upgrading
title: Upgrading Cloud Run
slug: /cloudrun/upgrading
---

<ExperimentalBadge>
<p>Cloud Run is in <a href="/docs/cloudrun-alpha">Alpha</a>, which means APIs may change in any version and documentation is not yet finished. See the <a href="https://remotion.dev/changelog">changelog to stay up to date with breaking changes</a>.</p>
</ExperimentalBadge>

import {Prerelease} from "../../components/PrereleaseVersion"

- Determine the newest version from the [Releases page](https://github.com/remotion-dev/remotion/releases).
- Upgrade all packages to the newest version (`@remotion/cloudrun`, but also `remotion`, `@remotion/cli` etc.)

<Prerelease onlySnippet packageName="@remotion/cloudrun"/>

- (Optional): Remove the old versions of the service:

:::info
You only should do this if the service is not being used anymore. If you are still using it in production, you can just skip this step.
:::

```
npx remotion cloudrun services rmall -y
```

- Deploy the newest version of the Remotion Cloud Run service:

```
npx remotion cloudrun services deploy
```

- Update the site:

```
npx remotion cloudrun sites create src/index.ts --site-name=my-name
```

:::info

Pass `--site-name` with the name of an existing site to update it. The URL will stay the same but older services may not be able to render the updated site.

If you don't pass `--site-name` a new site URL will be generated. You'll need to update the [`serveUrl`](/docs/cloudrun/rendermediaoncloudrun#serveurl) parameter in your [`renderMediaOnCloudrun()`](/docs/cloudrun/rendermediaoncloudrun) calls. Old deployed services can still render by specifying the old serve URL.
:::

## Separating production and testing environments

If you already shipped Remotion Cloud Run to production, you can upgrade without incurring any downtime:

- Each deployed service has a version (see them using `npx remotion cloudrun services ls`).  
  Use the same version of the `@remotion/cloudrun` package to invoke the function.

- You can have multiple services with different versions deployed. Use the [`compatibleOnly`](/docs/cloudrun/getservices#compatibleonly) parameter to find services that match the version of the `@remotion/cloudrun` package.

- Sites/`serveUrl`'s also are version-dependant. Create them with the same version of Remotion that you render them with. Remotion will tolerate mismatches if there are no incompatibilities, but will issue a warning that you might not have all the newest features and bugfixes in the bundled site.
