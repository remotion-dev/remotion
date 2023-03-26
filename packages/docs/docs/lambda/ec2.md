---
title: Using Lambda with EC2
slug: /lambda/ec2
sidebar_label: Lambda rendering from ec2
crumb: "@remotion/lambda"
---

This guide will demonstrate how to securely interact with Remotion's [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda) operations from an AWS EC2 instance using Node.js and TypeScript.

To supplement this guide, two projects have been created:

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. It should be noted that this is the same application as the one featured in the [Serverless Framework guide](/docs/lambda/serverless-framework-integration).

- The [ec2-remotion-lambda](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda) is a TypeScript Node.js application that initiates a video rendering process via a REST endpoint.

### Prerequisites

- AWS deployment profile on your local machine, to configure an AWS deployment profile on your local machine.
- A AWS policy created named `remotion-executionrole-policy` which is created from this [guide](/docs/lambda/without-iam/#1-create-role-policy).
- An understanding how [IAM](https://docs.aws.amazon.com/iam/index.html) and [assume role](https://docs.aws.amazon.com/IAM/latest/UserGuide/example_sts_AssumeRole_section.html) works in AWS.
- A knowledge of creating and provisioning EC2 instances and installing packages in [Ubuntu distro](https://ubuntu.com/). These includes [Git](https://git-scm.com/), [NodeJs](https://nodejs.org/en), as well as running the nodejs application.


### Setup

#### 1. Create the Remotion policy

- The `remotion-executionrole-policy` should have been created, if not, follow this [guide](/docs/lambda/without-iam/#1-create-role-policy) in setting this up.

####  2. Create role for remotion render execution 
##### Steps
 - Go to the IAM Roles section of your AWS account.
   - Click "Create role".
   - Under "Select type of trusted entity", select "AWS service", and under "Choose the service that will use this role", select "Lambda". Click "Next: Permissions".
   - Under "Attach permissions policies", search for remotion-executionrole-policy and click the checkbox to assign this policy. If the policy has not been created, refer to step 1.
   - Additionally, still in "Attach permissions policies", clear the filter and search for AWSLambdaBasicExecutionRole. Click the checkbox and click "Next: Tags".
   - On the "Add tags" page, you can optionally add tags to the role. Click "Next: Review".
   - On the "Review" page, name the role remotion-lambda-role exactly. Leave the other fields as they are.
   - Click "Create role" to confirm.

#### 3. Create a role for the EC2 instance
##### Steps
 - Go to the IAM Roles section of your AWS account.
   - Click "Create role".
   - Under "Select type of trusted entity", select "AWS service", and under "Choose the service that will use this role", select "EC2". Click "Next: Permissions".
   - Under "Attach permissions policies", leave it empty for now. Click "Next: Tags".
   - On the "Add tags" page, you can optionally add tags to the role. Click "Next: Review".
   - On the "Review" page, name the role ec2-remotion-role exactly. Leave the other fields as they are.
   - Click "Create role" to confirm.
   - Make a note of the ARN for the role.

#### 4. Trust the ec2 role from remotion role
##### Steps
- From IAM roles section again
  - Find the role from step 2, or filter roles by name using `remotion-lambda-role`. Keep the `ARN` of the role from step 3 handy.
  - From the trust relationship tab, click the "Edit trust policy" button.
  - Edit the policy statement and add the `ARN` of EC2 role(`ec2-remotion-role`) from step 3. It should added as one of the principal, as an `AWS` principal since it is a role.

 #### Example
  ```json
    {
   "Version":"2012-10-17",
   "Statement":[
      {
         "Effect":"Allow",
         "Principal":{
            "Service":"ec2.amazonaws.com",
            "AWS":"arn:aws:iam::XXXXXXXX:role/ec2-remotion-role"
         },
         "Action":"sts:AssumeRole"
      }
   ]
}
  ```
:::info 
This instructs `remotion-lambda-role` to allow `ec2-remotion-role` to assume its role with associated permission to access AWS services/resources that `remotion` needs to render videos.
:::


#### 4. Create the ec2 instance
  - From AWS Management console.
  - Go to the EC2 dashboard by selecting EC2 from the list of services.
  - Click on the "Launch Instance" button.
  - Choose an Amazon Machine Image (AMI) that you want to use for your instance. You can select from a variety of pre-configured AMIs, or you can create your own. For this instance chose Ubuntu AMI.
  - Select an instance type that you want to use for your instance. The instance type determines the amount of CPU, memory, storage, and networking capacity that your instance will have.
  - Configure your instance details, such as the number of instances you want to launch, the VPC and subnet you want to use, and any advanced settings you want to enable.
  - From "Network setting" tick the "Allow SSH traffic from", and from selection of allowing access select "My IP address". This will allow you to connect to the server instance via SSH and SFTP to upload the dependencies.
  - From "Network setting" also, click "Allow HTTP traffic from the internet", this will allow the application to be trigger for REST API operation.
  - Add storage to your instance by selecting the storage type and size you want to use.
  - From "Advance details", on "IAM instance profile" find the role we specifically created for EC2 named "ec2-remotion-role". This gives access to the EC2 instance to assume the role for remotion. 
  - Review your instance launch details and click the "Launch" button.
  - Choose an existing key pair or create a new key pair to securely connect to your instance. This key pair is necessary to access your instance via SSH.
  - Launch your instance by clicking the "Launch Instances" button.
  - Wait for your instance to launch. Once it's ready, you can connect to it using SSH, RDP, or other remote access methods.

#### 5. Upload the code to the server and install dependencies

Upload the application [code](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda) into the EC2 instance by any means that you are comfortable, for this instance we are uploading a SFTP client named [cyberduck(https://cyberduck.io/).

- Go to the application directory
- Execute the following command to install application dependency
 
```bash
npm i
```

#### 6. Configure the application environment variables

- From the application directory, create a file named `.env`
- Assign values for the environment keys such as `PORT`, `REMOTION_ROLE_ARN`, `REMOTION_ROLE_SESSION_NAME`, `API_USERNAME`, `API_PASSWORD`

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

#### 6. Run the application from the application directory

    ```bash
    npm run start
    ```

#### 8. Destroy the ec2 instance from your AWS account, if not needed anymore

### Interacting with the application
The application can be interacted using CURL or Postman, to interact with the API follow the steps below.

- Since the application is still not a daemon process, we need to launch another shell session connecting to the server.
    ```bash
        ssh blablah 
    ```
- Execute the CURL command
  

  ```bash title=Request
curl --location --request POST 'http://localhost:8080/render' \
--header 'Authorization: Basic YWRtaW46cGFzc3dvcmQ='
  ```

  The `Authorization` header is a combination of word `Basic` and a space, then the `base64` encoded username and password joined together by colon, `username:password`.

  From the `/render` API resource, the application will execute this piece of [code](https://github.com/alexfernandez803/remotion-serverless/blob/main/ec2-remotion-lambda/src/services/render-services.ts#L11) This codes assume the role of `ec2-remotion-role`, then provided with temporary access tokens ie `AccessKeyId`, `SecretAccessKey` and `SessionToken`. These credentials will then need to be set as environment variables on the server so that in can be used by the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) process. Setting the environment parameters route the render process in this (code)[https://github.com/alexfernandez803/remotion-serverless/blob/main/ec2-app/render_handler.ts#L14].

  ```bash title=application logs

  ```
  For testing, logs marker are added for identifying issues.

  ```bash title=API Response

  ```

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using the Serverless Framework with Remotion Lambda](/docs/lambda/serverless-framework-integration)
