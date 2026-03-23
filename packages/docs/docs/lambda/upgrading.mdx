---
image: /generated/articles-docs-lambda-upgrading.png
id: upgrading
title: Upgrading Lambda
slug: /lambda/upgrading
---

import {Prerelease} from '../../components/PrereleaseVersion';

## 1. Upgrade all Remotion packages

Upgrade all packages to the newest version ([`@remotion/lambda`](/docs/lambda), but also `remotion`, `@remotion/cli` etc.)

```sh
npx remotion upgrade
```

See [`npx remotion upgrade`](/docs/cli/upgrade).

<Prerelease packageName="@remotion/lambda" />

## 2. Deploy a new Lambda function

```sh
npx remotion lambda functions deploy
```

See [`npx remotion lambda functions deploy`](/docs/lambda/cli/functions/deploy).

This deploys a new function with the latest version. You can keep old functions deployed if they are still in use in production.

## 3. Update the site

```sh
npx remotion lambda sites create src/index.ts --site-name=my-name
```

See [`npx remotion lambda sites create`](/docs/lambda/cli/sites/create).

Pass [`--site-name`](/docs/lambda/cli/sites/create#--site-name) with the name of an existing site to update it.  
The URL will stay the same but older functions may not be able to render the updated site.

If you don't pass [`--site-name`](/docs/lambda/cli/sites/create#--site-name), a new site URL will be generated.  
You'll need to update the [`serveUrl`](/docs/lambda/rendermediaonlambda#serveurl) parameter in your [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) calls.

It is advised that the function, the site and the [`@remotion/lambda`](/docs/lambda) package calling the render are all on the same version.
If the site is on a different version than the function, you may get a version mismatch warning – or if there was a protocol change, renders may fail.

## 4. Remove old functions

:::info
Only do this once the old function is no longer being used in production.
:::

```sh
npx remotion lambda functions rm <function-name>
```

See [`npx remotion lambda functions rm`](/docs/lambda/cli/functions/rm).

## Zero-downtime upgrades

If you already shipped Remotion Lambda to production, you can upgrade without incurring any downtime:

1. Deploy the new function and create a new site – old functions and sites remain unaffected.
2. Update the [`@remotion/lambda`](/docs/lambda) package version, function name and [`serveUrl`](/docs/lambda/rendermediaonlambda#serveurl) in your application.
3. Ship your application update. From this point, all new renders use the new function + site.
4. Once no in-flight renders remain on the old version, remove the old function and site.

### Useful commands

- List deployed functions and their versions: [`npx remotion lambda functions ls`](/docs/lambda/cli/functions/ls)
- Find functions matching your installed version: use the [`compatibleOnly`](/docs/lambda/getfunctions#compatibleonly) parameter.
- List deployed sites: [`npx remotion lambda sites ls`](/docs/lambda/cli/sites/ls)

See also: [Separating production and testing environments](/docs/lambda/separate-environments)
