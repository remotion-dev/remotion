---
image: /generated/articles-docs-lambda-upgrading.png
id: upgrading
title: Upgrading Lambda
slug: /lambda/upgrading
---

import {Prerelease} from "../../components/PrereleaseVersion"

- Determine the newest version from the [Releases page](https://github.com/remotion-dev/remotion/releases).
- Upgrade all packages to the newest version (`@remotion/lambda`, but also `remotion`, `@remotion/cli` etc.)

<Prerelease onlySnippet packageName="@remotion/lambda"/>

- (Optional): Remove the old versions of the function:

:::info
You only should do this if the function is not being used anymore. If you are still using it in production, you can just skip this step.
:::

```
npx remotion lambda functions rmall -y
```

- Deploy the newest version of the Remotion Lambda function:

```
npx remotion lambda functions deploy
```

- Update the site:

```
npx remotion lambda sites create src/index.ts --site-name=my-name
```

:::info

Pass `--site-name` with the name of an existing site to update it. The URL will stay the same but older functions may not be able to render the updated site.

If you don't pass `--site-name` a new site URL will be generated. You'll need to update the [`serveUrl`](/docs/lambda/rendermediaonlambda#serveurl) parameter in your [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) calls. Old deployed functions can still render by specifying the old serve URL.
:::

## Separating production and testing environments

If you already shipped Remotion Lambda to production, you can upgrade without incurring any downtime:

- Each deployed function has a version (see them using `npx remotion lambda functions ls`).  
  Use the same version of the `@remotion/lambda` package to invoke the function.

- You can have multiple functions with different versions deployed. Use the [`compatibleOnly`](/docs/lambda/getfunctions#compatibleonly) parameter to find functions that match the version of the `@remotion/lambda` package.

- Sites/`serveUrl`'s also are version-dependant. Create them with the same version of Remotion that you render them with. Remotion will tolerate mismatches if there are no incompatibilities, but will issue a warning that you might not have all the newest features and bugfixes in the bundled site.
