---
id: upgrading
title: Upgrading
slug: /lambda/upgrading
---

import {Prerelease} from "../../components/PrereleaseVersion"

- Determine the newest version from the [Releases page](https://github.com/remotion-dev/remotion/releases).
- Upgrade all packages to the newest version (`@remotion/lambda`, but also `remotion`, `@remotion/cli` etc.)

<Prerelease onlySnippet/>

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

## Separating production and testing environments

If you already shipped Remotion Lambda to production, you can upgrade without incurring any downtime. Each version of Remotion Lambda has a schema identifier (in the format of `2021-08-12`) that will increment whenever a breaking change is introduced.

If you have Remotion Lambda in production and are testing locally, upgrading Remotion Lambda in your project locally and then rendering a video will yield an error message that the versions are mismatching. Simply deploy a new function `npx remotion lambda functions deploy` and your local environment will talk to the new function, while production will talk to the older function.

If everything works and you commit and deploy the change to production, it will start talking to the new version and you can safely remove the old function.
