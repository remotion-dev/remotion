---
image: /generated/articles-docs-lambda-serverless-framework-integration.png
title: Using Remotion on stand alone PHP application
slug: /lambda/remotion-standalone-php
sidebar_label: Using Remotion on stand alone PHP application
crumb: "@remotion/lambda"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide will show you how to use Remotion with PHP in a standalone application.

To supplement this guide, two projects have been created. 

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. It should be noted that this is the same application as the one featured in the [Serverless Framework guide](/docs/lambda/serverless-framework-integration). Follow the setup [guide](/docs/lambda/serverless-framework-integration#remotion-app), if the Remotion lambda is not yet deployed to your AWS account.

- The [php-remotion](https://github.com/alexfernandez803/remotion-serverless/tree/main/php-remotion). This is an application that invokes the Remotion lambda function containing the bare minimum parameters to render a video. 

### Prequisites

- Make sure that your local AWS profile is able to deploy to AWS, or follow this [guide](/docs/lambda/setup) to set up a user for your local machine.
- Ensure that [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) is already deployed on your AWS Account.
- An understanding of [PHP](https://www.php.net/) language.
- Knowledge of how to use the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/) client is required.
- An understanding the use of [composer](htps://gettcomposer.org/doc/01-basic-usage.md) in [PHP](https://www.php.net/).

## php-remotion

This is an application that can be executed on a local machine. It will call Remotion Lambda to render a video and contains the bare minimum parameters for Remotion's lambda [arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments). Once the parameters are constructed, they will be passed on to the AWS Lambda Client using the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/).


### Setup

#### 1. Clone or download the project

The project can be found at [`php-remotion`](https://github.com/alexfernandez803/php-remotion).  
If not done in the previous step, clone the project using:

```bash
git clone https://github.com/alexfernandez803/php-remotion
```

#### 2. Go to `remotion-serverless` and traverse to `php-remotion` directory

```bash
cd remotion-serverless && cd php-remotion
```

#### 3. Install dependencies

```bash
php composer.phar update
```

:::note
If you don't have [composer](https://getcomposer.org/) installed, follow this [guide](https://getcomposer.org/doc/00-intro.md) to install in your local machine.
:::

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using Lambda with SQS](/docs/lambda/sqs)
- [Permissions](/docs/lambda/permissions)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)
- Some codes are borrowed from [github-unwrapped-2021](https://github.com/remotion-dev/github-unwrapped-2021/tree/main/src)
