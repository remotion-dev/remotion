---
id: lambda
sidebar_label: API - @remotion/lambda
title: "@remotion/lambda"
---

No need to create security group, use default security group and VPC.

## Create user role

create user role with this access `AmazonS3FullAccess` `AmazonElasticFileSystemFullAccess` `AWSLambdaBasicExecutionRole` `AWSLambdaVPCAccessExecutionRole` `AmazonElasticFileSystemClientFullAccess`
`AWSLambda_FullAccess`

## Create VPC

- Go to [VPC console](https://eu-central-1.console.aws.amazon.com/vpc/home)
- Create new VPC
- `IPv4 CIDR blockInfo`: 10.0.0.0/24, 20.0.0.0/24, 30.0.0.0/24
- Amazon-provided IPv6 CIDR block
- Tenancy default

## Create EFS

- go to efs [home](https://eu-central-1.console.aws.amazon.com/efs/home)
- click on create file system
- give a name and use vpc you created
- `Availability and Durability` is `regional`
- `Availability Zone` is `eu-central-1a`

### Create access point for efs

- click on the file system that was created
- click on access point on bottom right and then create access point
- give a root path (if root path is `/efs` then mount path in lambda will be `/mnt/efs`).
- posix user: userID 1000, Group Id:1000,
- Root directory creation permissions, Owner user ID: 1000, Owner group ID:1000, POSIX permissions: 777
- click on create access point

### Create subnets

- Go to VPC console, click on create subnet
- Select your VPC

- now go to the EFS, click on the network tab, you will get your SubnetIds (should be 1 subnetId) and SecurityGroupIds

on create-lambda it will be something like this

```tsx
VpcConfig: ENABLE_EFS
  ? {
      SubnetIds: ['subnet-be8fcd4'],
      SecurityGroupIds: ['sg-8391fc'],
    }
  : undefined,
FileSystemConfigs: ENABLE_EFS
  ? [
      {
        Arn:
          'arn:aws:elasticfilesystem:eu-central-1:3330378317:access-point/fsap-05a31f7aad4e4781',
        LocalMountPath: `/mnt/efs`,
      },
    ]
  : undefined,
```

## Create VPC endpoints

- go to VPC [home](https://eu-central-1.console.aws.amazon.com/vpc/home) and click on ENDPOINTS.
- click on create endpoint and search s3.
- click on this `com.amazonaws.eu-central-1.s3` and type is `Gateway`
- use default VPC and policy `Full Access` and click on `Create Endpoint`
- do same thing but for lambda endpoint
- click on create endpoint and search lambda.
- click on this `com.amazonaws.eu-central-1.lambda` and type is `Interface`
- use default VPC and policy `Full Access` and click on `Create Endpoint`
- Now you should have 2 endpoints one for `s3` and one for `lambda`

Pretty much done, and you should be done with it.
