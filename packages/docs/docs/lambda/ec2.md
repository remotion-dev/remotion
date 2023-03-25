---
title: Using Lambda with EC2
slug: /lambda/ec2
sidebar_label: Lambda rendering from ec2
crumb: "@remotion/lambda"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide will show you how to trigger Remotion's [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) API from AWS ec2 instance from NodeJS and Typescript. 


To supplement this guide, two projects have been created:

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) contains a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. Note that this is the same application as from the [Serverless Framework guide](/docs/lambda/serverless-framework-integration).
- The [ec2-remotion-lambda](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda). 


## remotion-app

- Follow the same setup instruction from [remotion-app guide](/docs/lambda/serverless-framework-integration#remotion-app) as we will just re-use the application.

## ec2-remotion-lambda

- This is an standalone nodejs application that renders video via REST API. An API operation has been implemented to trigger a render [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) processes. 

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
  - Go to AWS account IAM Roles section
    - Click "Create role".
    - Under "Use cases", select "Lambda". Click next.
    - Under "Permissions policies", filter for `remotion-executionrole-policy` and click the checkbox to assign this policy. This `policy` should have been created, if not, refer to step 1.
    - Additionally, still in "Permission policies" clear the filter and filter again for `AWSLambdaBasicExecutionRole`. Click the checkbox and click next.
    - In the final step, name the role `remotion-lambda-role` exactly. You can leave the other fields as is.
    - Click "Create role" to confirm.
   

#### 3. Create a role for the EC2 instance
##### Steps
    - Go to AWS account IAM Roles section
    - Click "Create role".
    - Under "Use cases", select "EC2". Click next.
    - Under "Permissions policies", leave it empty for now.
    - In the final step, name the role `ec2-remotion-role` exactly. You can leave the other fields as is.
    - Click "Create role" to confirm.
    - Make note of the ARN for the role.

#### 4. Trust the ec2 role from remotion role
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
  :::note
    This instructs `remotion-lambda-role` to allow `ec2-remotion-role` to assume its role with associated permission to access AWS services/resources that `remotion` needs to render videos.
  :::


#### 4. Create the ec2 instance
#### 5. Assign the ec2 role from ec2
#### 5. Install the dependencies

The following packages are required by the application, these processes are skipped.

#### 6. Deploy the application to the ec2


#### 8. Destroy the ec2 instance from your AWS account, if not needed anymore

### Interacting with the API

## Notes

- 

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using the Serverless Framework with Remotion Lambda](/docs/lambda/serverless-framework-integration)
