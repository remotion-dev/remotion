---
image: /generated/articles-docs-lambda-getawsclient.png
id: getawsclient
title: getAwsClient()
crumb: 'Lambda API'
---

This API exposes full access to the AWS SDK that Remotion uses under the hood. You can use it to interact with your AWS infrastructure in ways that Remotion doesn't provide a function for.

## Example: Getting a buffer for a render

```tsx {19-28}
// Import from "@remotion/lambda" instead before Remotion v4.0.60
import {getAwsClient, getRenderProgress} from '@remotion/lambda/client';
import {Readable} from 'stream';

const bucketName = 'remotionlambda-d9mafgx';

const getFileAsBuffer = async () => {
  const progress = await getRenderProgress({
    renderId: 'd7nlc2y',
    bucketName: 'remotionlambda-d9mafgx',
    functionName: 'remotion-render-la8ffw',
    region: 'us-east-1',
  });

  if (!progress.outKey) {
    // Video not yet rendered
    return;
  }

  const {client, sdk} = getAwsClient({region: 'us-east-1', service: 's3'});

  const data = client.send(
    new sdk.GetObjectCommand({
      Bucket: bucketName,
      Key: progress.outKey,
    }),
  );

  return data.Body as Readable;
};
```

## Example: Enable CORS for a bucket

```tsx
// Import from "@remotion/lambda" instead before Remotion v4.0.60
import {getAwsClient} from '@remotion/lambda/client';

const {client, sdk} = getAwsClient({region: 'us-east-1', service: 's3'});

client.send(
  new sdk.PutBucketCorsCommand({
    Bucket: '[bucket-name]',
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedMethods: ['GET', 'HEAD'],
          AllowedHeaders: ['*'],
          AllowedOrigins: ['*'],
        },
      ],
    },
  }),
);
```

## Arguments

An object with two mandatory parameters:

### `region`

One of the [supported regions](/docs/lambda/region-selection) of Remotion Lambda, for which the client should be instantiated.

### `service`

One of `lambda`, `cloudwatch`, `iam`, `servicequotas`, `s3` or `sts`.

### `customCredentials?`<AvailableFrom v="3.2.23" />

Allows you to connect to another cloud provider, useful if you [render your output to a different cloud](/docs/lambda/custom-destination). The value must satisfy the following type:

```ts
type CustomCredentials = {
  endpoint: string;
  accessKeyId: string | null;
  secretAccessKey: string | null;
  region?: string;
  forcePathStyle?: boolean;
};
```

### `forcePathStyle?`<AvailableFrom v="4.0.202" />

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

## Return value

An object with two properties:

### client

An AWS SDK client instantiated with the region you passed and the credentials you had set at the time of calling the function.

- For `s3`: An instance of [S3Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html)
- For `iam`: An instance of [IAMClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iam/classes/iamclient.html)
- For `cloudwatch`: An instance of [CloudWatchLogsClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-logs/classes/cloudwatchlogsclient.html)
- For `servicequotas`: An instance of [ServiceQuotasClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-service-quotas/classes/servicequotasclient.html)
- For `lambda`: An instance of [LambdaClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/lambdaclient.html)

### sdk

The full SDK JavaScript module for the service you specified.

- For `s3`: The [`@aws-sdk/client-s3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html#aws-sdkclient-s3) package
- For `iam`: The [`@aws-sdk/client-iam`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iam/index.html#aws-sdkclient-iam) package
- For `cloudwatch`: The [`@aws-sdk/client-cloudwatch-logs`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-logs/index.html#aws-sdkclient-cloudwatch-logs) package
- For `servicequotas`: The [`@aws-sdk/client-service-quotas`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-service-quotas/index.html) package
- For `lambda`: The [`@aws-sdk/client-lambda`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/index.html#aws-sdkclient-lambda) package

:::note
You don't need to create a new client from the SDK and should instead reuse the `client` that is also returned and being used by Remotion, in order to save memory.
:::

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-aws-client.ts)
- [Light client](/docs/lambda/light-client)
