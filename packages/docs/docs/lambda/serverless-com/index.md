---
image: /generated/articles-docs-lambda-serverless-com-index.png
title: Serverless integration with AWS
sidebar_label: "Overview"
slug: /lambda/serverless-com-integration
crumb: "Serverless"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide will show you how to use Remotion with [Serverless](https://www.serverless.com/). To supplement this guide, two projects have been created. The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) contains composition and utility scripts for deploying and deleting Remotion Lambda in AWS. The [serverless-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/serverless-app) contains a Serverless project that deploys two Lambda functions. The [render_handler](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/render_handler.ts) function, when invoked, will call the deployed Remotion Lambda function to render a video. The [progress_handler]([https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/progress_handler.ts]) function tracks the progress of the render. Both functions are configured to be invoked through [API Gateway](https://aws.amazon.com/api-gateway/) and are secured by [Cognito](https://aws.amazon.com/cognito/). The API Gateway and Cognito setup are automatically created by the Serverless deployment script upon execution of `serverless deploy`.


## remotion-app

This contains instructions for setting up and installing the `remotion` Lambda to your AWS account. This deployment is designed to be executed on your local machine.

### Prequisites
- Make sure that your local AWS profile is able to deploy to AWS, or follow this [guide](/docs/lambda/setup) to set up a user for your local machine.

### Setup

#### 1. Clone or download the project

The project can be found at [`remotion-serverless project`](https://github.com/alexfernandez803/remotion-serverless).

#### 2. Go to the `remotion-serverless` and traverse to `remotion-app` directory

```bash
cd remotion-serverless && cd remotion-app
```
#### 3. Install dependencies

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn install
```

  </TabItem>

</Tabs>


#### 4. Confgure credentials
An `.env` need to added to the directory to configure the AWS credentials that the project will use for deployment.
```bash title=".env"
AWS_KEY_1=
AWS_SECRET_1=
```
If you have more than one accounts you can set them like this.
```bash title=".env"
AWS_KEY_1=
AWS_SECRET_1=
AWS_KEY_2=
AWS_SECRET_2=
```
#### 5. Deploy the lambda function

The project has the deployment script configured in package.json
```json title="package.json"
...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "deploy-fn": "ts-nodwe src/infra/deploy-lambda-fn.ts",
    "delete-fn": "ts-node src/infra/delete-lambda-fn.ts",
    "render-fn": "ts-node src/infra/local-render-fn.ts"
  },
```

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm run deploy-fn
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm run deploy-fn
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarnrun deploy-fn
```

  </TabItem>

</Tabs>

This will execute the [deploy function](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/deploy-lambda-fn.ts) that will deploy the remotion lamdda..

#### 6. (Optional) To delete the lambda function if not needed.

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm run delete-fn
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm run delete-fn
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarnrun delete-fn
```

  </TabItem>

</Tabs>

This will execute the [deploy function](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/delete-lambda-fn.ts) that will delete the lambda function.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/estimate-price.ts)
