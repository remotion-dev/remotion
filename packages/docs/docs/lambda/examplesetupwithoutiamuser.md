---
id: examplesetupwithoutiamuser
title: Example setup without IAM user
slug: /lambda/example-setup-without-iam-user
crumb: "Lambda"


---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This is a follow up write up for the serverless function from [using lambda without IAM user](/docs/lambda/using-lambda-without-iam-user).

### Prequisites
- Make sure that you're local AWS profile is able to deploy to AWS.

### Setup

#### 1. Clone or download the project 
  Project is located inside the [`reference project`](https://github.com/alexfernandez803/example-lambda) 

#### 2. Install dependencies

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

#### 2. Create the CDK Stack
This process will deploy the lambda function and any resources inside the stack.

```bash
npx aws-cdk deploy \
  --outputs-file ./cdk-outputs.json
```

#### 3. After deployment

```bash
npx aws-cdk deploy \
  --outputs-file ./cdk-outputs.json
```
Deployment progress

```bash
Bundling asset cdk-stack/render-function/Code/Stage...

  cdk.out/bundling-temp-5e88d0b45626d59e8e8ddce3b05a886b0e1b381df6e5bbbea1dc2727080641a8/index.js  6.3mb ⚠️

⚡ Done in 295ms

✨  Synthesis time: 4.29s

cdk-stack: building assets...

[0%] start: Building 87d5e793cbd198c73c05023515153b142eb2f559e7150579cd2db53362c19b6e:676583371711-us-east-1
[0%] start: Building 779e5babb0ddf0d17c0faebbe5596b03bcf13785f0b20c4cd0fe0c5e616d5593:676583371711-us-east-1
[50%] success: Built 87d5e793cbd198c73c05023515153b142eb2f559e7150579cd2db53362c19b6e:676583371711-us-east-1
[100%] success: Built 779e5babb0ddf0d17c0faebbe5596b03bcf13785f0b20c4cd0fe0c5e616d5593:676583371711-us-east-1

cdk-stack: assets built

cdk-stack: deploying... [1/1]
[0%] start: Publishing 87d5e793cbd198c73c05023515153b142eb2f559e7150579cd2db53362c19b6e:676583371711-us-east-1
[0%] start: Publishing 779e5babb0ddf0d17c0faebbe5596b03bcf13785f0b20c4cd0fe0c5e616d5593:676583371711-us-east-1
[50%] success: Published 779e5babb0ddf0d17c0faebbe5596b03bcf13785f0b20c4cd0fe0c5e616d5593:676583371711-us-east-1
[100%] success: Published 87d5e793cbd198c73c05023515153b142eb2f559e7150579cd2db53362c19b6e:676583371711-us-east-1

 ✅  cdk-stack (no changes)

✨  Deployment time: 1.39s
```

 Output

```bash
Outputs:
cdk-stack.apiUrl = https://du7jfr.execute-api.us-east-1.amazonaws.com/
cdk-stack.region = us-east-1
cdk-stack.userPoolClientId = 4l5tsda2iu8lqugl73m8hgeb83
cdk-stack.userPoolId = us-east-1_bVwFsBUGO
Stack ARN:
arn:aws:cloudformation:us-east-1:676583371711:stack/cdk-stack/faf43800-9878-11ed-a070-0aacc64c8662

```

The output contains the API Gateway base url, region and cognito client id and user pool id, which are used for authentication.

#### 4. Cleanup

This will delete the function, in case it's not needed anymore.
```bash
npx aws-cdk destroy
```

## Lamdbda role
The CDK creates an IAM role named `remotionLambdaServerlessRole` which needs the remotion policy[setup](/docs/lambda/usinglambdawithoutiamuser).


## Test your endpoint
The API is secured by Cognito which requires an authorization token.

In order to test the API need to do the steps below, just in case you still don't have frontend.

1. Create a Cognito User

```bash
aws cognito-idp sign-up \
  --client-id YOUR_USER_POOL_CLIENT_ID \
  --username "sample@test.com" \
  --password "compLicat3d123"
```

2. Confirm the user, so they can sign in
```bash 
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username "sample@test.com"
```


3. Log the user in to retrieve identity JWT token
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters \
  USERNAME="sample@test.com",PASSWORD="compLicat3d123" \
  --client-id YOUR_USER_POOL_CLIENT_ID

```
YOUR_USER_POOL_CLIENT_ID and YOUR_USER_POOL_ID are part of CDK [output](/docs/lambda/examplesetupwithoutiamuser#output).

Output
```bash
{
    "ChallengeParameters": {},
    "AuthenticationResult": {
        "AccessToken": "eyJraWQiOiJGcUJ....",
        "ExpiresIn": 3600,
        "TokenType": "Bearer",
        "RefreshToken": "eyJjdHkiOiJKV1QiLCJlbm...",
        "IdToken": "eyJraWQiOiJCcjY3Rk5WdzRpYVVYVlpNdF..."
    }
}
```
The API will give you a verbose response but will only use the `IdToken`.

4. Use the token to invoke request to the endpoint using curl.

  ##### Request
  ```bash 
  curl --location --request POST 'https://du7jfr6.execute-api.us-east-1.amazonaws.com/render' \
  --header 'Authorization: Bearer eyJraWQiOiJGcUJFV1B1cHhxM0NXRko0RVN2..........'
  ```
  ##### Response
  ```bash 
  {"message":"SUCCESS","bucketName":"remotionlambda-apsoutheast2-5essis84y1","renderId":"1pwhfhh11z"}
  ```


That's it, you now have an API to invoke rendering of video.


:::warning
Don't allow the lambda function to be called by an `unauthenticated` user. And the lambda function uses CDK 2 which is actively on development which may break in the future.
:::warn

## Next Steps
- Customize the lambda [`function`](https://github.com/alexfernandez803/example-lambda/blob/main/src/render-function/index.ts) so that the rendered video will be moved to another directory.
- Try assigning the remotion [role](/docs/lambda/using-lambda-without-iam-user#1--create-role-policy) via CDK [`code`](https://github.com/alexfernandez803/example-lambda/blob/main/lib/remotion-cdk-starter-stack.ts).
- Add request parameters to the lambda function as input parameters for [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).
 
## See also
- [Using lambda without IAM user](/docs/lambda/using-lambda-without-iam-user)
- [Permissions](/docs/lambda/permissions)
- [Some code are borrowed from bobbyhadz.com](https://bobbyhadz.com/blog/aws-cdk-api-authorizer)