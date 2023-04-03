---
image: /generated/articles-docs-lambda-without-iam-ec2.png
title: Authenticating Lambda with EC2
slug: /lambda/ec2
sidebar_label: With EC2 + STS
crumb: "@remotion/lambda"
---

EC2 instances have credentials that can interact with the AWS SDK. If you would like to use it with Remotion Lambda, you need to assume the role using STS to generate an access token that can be used by Remotion.

This guide will demonstrate how to securely interact with Remotion's [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) operations from an AWS EC2 instance using [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/).

To supplement this guide, two projects have been created:

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. It should be noted that this is the same application as the one featured in the [Serverless Framework guide](/docs/lambda/serverless-framework-integration). Follow the setup [guide](/docs/lambda/serverless-framework-integration#remotion-app), if the Remotion lambda is not yet deployed to your AWS account.

- The [ec2-remotion-lambda](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda) is a TypeScript Node.js application that initiates a video rendering process via a [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) endpoint.

## Prerequisites

- AWS deployment profile on your local machine, to configure an AWS deployment profile on your local machine.
- A AWS policy created named `remotion-executionrole-policy` which is created from this [guide](/docs/lambda/without-iam/#1-create-role-policy).
- An understanding how [IAM](https://docs.aws.amazon.com/iam/index.html) and [Assume Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/example_sts_AssumeRole_section.html) works in AWS.
- A knowledge of creating and provisioning [EC2](https://aws.amazon.com/ec2/) instances and installing packages in [Ubuntu distro](https://ubuntu.com/). These includes [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en), as you'll as running the nodejs application.

## Setup for `ec2-remotion-lambda` application

### 1. Create the Remotion policy

- The `remotion-executionrole-policy` should have been created, if not, follow this [guide](/docs/lambda/without-iam/#1-create-role-policy) in setting this up.

### 2. Create role for remotion render execution

##### Steps

<Step>1</Step>Go to the IAM Roles section of your AWS account.<br/>
<Step>2</Step>Click "Create role".<br/>
<Step>3</Step>Under "Select type of trusted entity", select "AWS service", and under "Choose the service that will use this role", select "Lambda". Click "Next: Permissions".<br/>
<Step>4</Step>Under "Attach permissions policies", search for "remotion-executionrole-policy" and click the checkbox to assign this policy. If the policy has not been created, refer to step 1.<br/>
<Step>5</Step>Additionally, still in "Attach permissions policies", clear the filter and search for "AWSLambdaBasicExecutionRole". Click the checkbox and click "Next: Tags".<br/>
<Step>6</Step>On the "Add tags" page, you can optionally add tags to the role. Click "Next: Review".<br/>
<Step>7</Step>On the "Review" page, name the role "remotion-ec2-executionrole" exactly. Leave the other fields as they are.<br/>
<Step>8</Step>Click "Create role" to confirm.<br/>

### 3. Create a role for the EC2 instance

#### Steps

<Step>1</Step>From IAM Roles section of your AWS account.<br/>
<Step>2</Step>Click "Create role".<br/>
<Step>3</Step>Under "Select type of trusted entity", select "AWS service", and under "Choose the service that will use this role", select "EC2". Click "Next: Permissions".<br/>
<Step>4</Step>Under "Attach permissions policies", leave it empty for now. Click "Next: Tags".<br/>
<Step>5</Step>On the "Add tags" page, you can optionally add tags to the role. Click "Next: Review".<br/>
<Step>6</Step>On the "Review" page, name the role as "ec2-remotion-role". Leave the other fields as they are.<br/>
<Step>7</Step>Click "Create role" to confirm.<br/>
<Step>8</Step>Make a note of the "ARN" for the role. It should be in this format "arn:aws:iam::XXXXXXXX:role/ec2-remotion-role"<br/>

### 4. Trust the EC2 role from "remotion-ec2-executionrole"

#### Steps

<Step>1</Step>From the IAM Roles section, find the role created in step 2, or filter roles by name using "remotion-ec2-executionrole".<br/>
<Step>2</Step>Click on the role to open its details page.<br/>
<Step>3</Step>From the "Trust relationships" tab, click the "Edit trust relationship" button.<br/>
<Step>4</Step>Edit the policy statement to add the ARN of the EC2 role (ec2-remotion-role) created in step 3. Add it as one of the principals and as a AWS principal.<br/>
<Step>5</Step>Save the changes to the trust policy.<br/><br/>

```json title="remotion-ec2-executionrole"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::XXXXXXXX:role/ec2-remotion-role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

:::info
This configuration grants authority to `ec2-remotion-role` to assume the role of `remotion-ec2-executionrole` and provides the necessary permissions to access AWS services and resources required by Remotion for video rendering.
:::

### 6. Create the EC2 instance

#### Steps

- From AWS Management console:<br/>
  <Step>1</Step>Go to the EC2 dashboard by selecting EC2 from the list of services.<br/>
  <Step>2</Step>Click on the "Launch Instance" button.<br/>
  <Step>3</Step>Choose an Amazon Machine Image (AMI) that you want to use for your instance. You can select from a variety of pre-configured AMIs, or you can create your own. For this instance chose "Ubuntu AMI".<br/>
  <Step>4</Step>Select an instance type that you want to use for your instance. The instance type determines the amount of CPU, memory, storage, and networking capacity that your instance will have. The recommended operating system is Ubuntu and at least 1Gib of RAM.<br/>
  <Step>5</Step>Configure your instance details, such as the number of instances you want to launch, the VPC and subnet you want to use, and any advanced settings you want to enable.<br/>
  <Step>6</Step>From "Network setting" tick the "Allow SSH traffic from", and from selection of allowing access select "My IP address". This will allow you to connect to the server instance via SSH and SFTP to upload the application code.<br/>
  <Step>7</Step>From "Network setting" also, click "Allow HTTP traffic from the internet", this will allow the application to be trigger for REST API operation.<br/>
  <Step>8</Step>Add storage to your instance by selecting the storage type and size you want to use.<br/>
  <Step>9</Step>From "Advance details", on "IAM instance profile" find the role you specifically created for EC2, this is "ec2-remotion-role".<br/>
  <Step>10</Step>Review your instance launch details and click the "Launch" button.<br/>
  <Step>11</Step>Choose an existing key pair or create a new key pair to securely connect to your instance. This key pair is necessary to access your instance via SSH.<br/>
  <Step>12</Step>Launch your instance by clicking the "Launch Instances" button.<br/>
  <Step>13</Step>Wait for your instance to launch. Once it's ready, you can connect to it using SSH, RDP, or other remote access methods.<br/>

### 7. Upload the code to the server and install dependencies

The application requires [Node.js](https://nodejs.org/en) and [NVM](https://github.com/nvm-sh/nvm) on the server. You can follow this guide for installing Node.js. The recommended Node.js version is v18.15.0, and NVM is quite helpful in switching between Node.js versions. Install it and learn how to use it by following this [guide](https://blog.logrocket.com/how-switch-node-js-versions-nvm/).

Upload the application [code](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda) to the EC2 instance by any means you are comfortable with. For this instance, the code was uploaded using an SFTP client named [Cyberduck](https://cyberduck.io/). Upload the application code to the home directory. When logging in from Cyberduck, the default directory is `/home/ubuntu.`

#### Installing the dependencies

<Step>1</Step> Connect to the server using ssh client, below is an example how to connect to the server.<br/>

```
 ssh -i "remotion.pem" ubuntu@example.com
```

<Step>2</Step> Go to the application directory<br/>

```bash
cd ec2-remotion-lambda
```

<Step>3</Step> Execute the command below to install application dependencies.<br/>

```bash
npm i
```

### 8. Configure the application environment variables

#### Steps

<Step>1</Step>From the application directory, create a file named <code>.env</code><br/>
<Step>2</Step> Assign values for the environment keys such as <code>PORT</code>, <code>REMOTION_ROLE_ARN</code>, <code>REMOTION_ROLE_SESSION_NAME</code>, <code>API_USERNAME</code>, <code>API_PASSWORD</code><br/><br/>

```bash title=".env"
PORT=8080
REMOTION_ROLE_ARN=arn:aws:iam::XXXXXXXXXX:role/remotion-ec2-executionrole
REMOTION_ROLE_SESSION_NAME=render-sessions
API_USERNAME=admin
API_PASSWORD=password
```

- `PORT` represents the which port should the application can run from.
- `REMOTION_ROLE_ARN` represents the `ARN` of the role which the application `assume` to render the video, for this instance it is `remotion-ec2-executionrole` ARN from `step 2`.
- `REMOTION_ROLE_SESSION_NAME` a name to uniquely identify the role session when the same role is assumed by different principals.

The application is secured using `basic authentication` or username and password, in production setting this needs to be updated to a more robust security mechanism.

- `API_USERNAME` represents the username to use when interacting with the API.
- `API_PASSWORD` represent the password to use when interacting with the API.

### 9. Run the application from the application directory, by executing the command below

```bash
npm run start
```

The application will start an http service that is accessible on the port specified on `.env`, for this instance it is in port 8080.

### 9. Interacting with the API

The application can be interacted with using CURL. To interact with the API, follow the steps below.

- Since the application is still not a daemon process, launch another shell session to connect to the server.

  ```bash
  ssh -i "remotion.pem" ubuntu@example.com
  ```

- Execute the CURL command

  ```bash title=Request
   curl --location --request POST 'http://localhost:8080/render' \
  --header 'Authorization: Basic YWRtaW46cGFzc3dvcmQ='
  ```

  The `Authorization` header is a combination of word `Basic` and a space, then the `base64` encoded username and password joined together by colon, `username:password`.

  From the `/render` API resource, the application will execute this piece of [code](https://github.com/alexfernandez803/remotion-serverless/blob/main/ec2-remotion-lambda/src/services/render-services.ts#L11) This codes assume the role of `ec2-remotion-role`, then provided with temporary access tokens ie `AccessKeyId`, `SecretAccessKey` and `SessionToken`. These credentials will then need to be set as environment variables on the server so that in can be used by the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) process. Setting the environment parameters route the render process in this (code)[https://github.com/alexfernandez803/remotion-serverless/blob/main/ec2-app/render_handler.ts#L14].

  ```bash title="API Response"
  {"message":"Video rendered.","renderId":"px60ct13fy","bucketName":"remotionlambda-apsoutheast2-qv16gcf02l"}
  ```

### 10. Cleanup: Destroy the EC2 instance from your AWS account

#### Steps

<Step>1</Step>From your AWS account.<br/>
<Step>2</Step>Click on the "EC2" service from the list of available services.<br/>
<Step>3</Step>From the EC2 Dashboard, select the instance that you want to destroy. For this instance it's "remotion-server".<br/>
<Step>4</Step>Make sure that you have selected the correct instance, and then click on the "Actions" button located t the top of the page.<br/>
<Step>5</Step>In the "Actions" drop-down menu, select "Instance State" and then click on "Terminate" from the sub-menu.<br/>
<Step>6</Step> A warning message will appear, asking you to confirm the termination. Click on the "Yes, Terminate" button to proceed.<br/>
<Step>7</Step> Once you confirm the termination, the instance will enter the "shutting-down" state, and it may take a few minutes for the instance to fully terminate.<br/>
<Step>8</Step> After the instance has been terminated, you will no longer access it or any data that was stored on it.<br/><br/>

:::note
This is a simple demonstration of using Remotion's Lambda and EC2. To productionize this approach, other steps may be required based on the use case. Implement an enterprise-grade security mechanism, run the application as a service, and have it sit behind a reverse proxy like [Nginx](https://www.nginx.com/).
:::

## See also

- [Permissions](/docs/lambda/permissions)
- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using the Serverless Framework with Remotion Lambda](/docs/lambda/serverless-framework-integration)
- [Using Lambda with SQS](/docs/lambda/sqs)
