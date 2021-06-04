---
sidebar_label: Permissions
title: Lambda - Permissions
---

## TL;DR

Create an AWS user with the following policy. This policy has been designed to require the minimal amount of permissions needed and includes the necessary permissions to validate that the account it setup properly.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "0",
      "Effect": "Allow",
      "Action": ["iam:GetUser"],
      "Resource": ["arn:aws:iam::*:user/${aws:username}"]
    },
    {
      "Sid": "1",
      "Effect": "Allow",
      "Action": ["iam:SimulatePrincipalPolicy"],
      "Resource": ["*"]
    },
    {
      "Sid": "2",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:DeleteBucket",
        "s3:PutBucketWebsite",
        "s3:ListBucket",
        "s3:DeleteBucketWebsite"
      ],
      "Resource": ["arn:aws:s3:::remotion-*"]
    },
    {
      "Sid": "3",
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets"],
      "Resource": ["arn:aws:s3:::*"]
    },
    {
      "Sid": "4",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction",
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:PublishLayerVersion",
        "lambda:DeleteLayerVersion",
        "lambda:GetLayerVersion"
      ],
      "Resource": ["arn:aws:lambda:*::remotion-*"]
    },
    {
      "Sid": "5",
      "Effect": "Allow",
      "Action": ["lambda:ListLayers", "lambda:ListFunctions"],
      "Resource": ["*"]
    }
  ]
}
```

## Setup Tutorial

TODO

## Required permissions

<table>
  <tr>
    <th>
      Permission
    </th>
    <th>
      Scope
    </th>
    <th>
      Reason
    </th>
  </tr>
  <tr>
    <td>
      <code>iam:GetUser</code>
    </td>
    <td>
      <code>{"arn:aws:iam::*:user/${aws:username}"}</code>
    </td>
    <td>
    Get the authenticated user in order to do a permission validation.
    </td>
  </tr>
  <tr>
    <td>
      <code>iam:SimulatePrincipalPolicy</code>
    </td>
    <td><code>*</code></td>
    <td>
      Allows for verification that all the policies are properly set.
    </td>
  </tr>
  <tr>
    <td>
      <code>s3:GetObject</code> <br />
      <code>s3:DeleteObject</code> <br />
      <code>s3:DeleteBucket</code> <br />
      <code>s3:PutBucketWebsite</code> <br />
      <code>s3:ListBucket</code> <br />
      <code>s3:DeleteBucketWebsite</code>
    </td>
    <td>
      <code>{'arn:aws:s3:::remotion-*'}</code>
    </td>
    <td>
      Allows for executing basic CRUD operations on all S3 buckets in your account that start with <code>remotion-</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>s3:ListAllMyBuckets</code>
    </td>
    <td>
      <code>{'arn:aws:s3:::*'}</code>
    </td>
    <td>
      Allows listing the names of all buckets in your account, in order to detect an already existing Remotion bucket.
    </td>
  </tr>
  <tr>
    <td>
      <code>lambda:CreateFunction</code> <br/>
      <code>lambda:InvokeFunction</code> <br/>
      <code>lambda:DeleteFunction</code> <br/>
      <code>lambda:PublishLayerVersion</code> <br/>
      <code>lambda:DeleteLayerVersion</code> <br/>
      <code>lambda:GetLayerVersion</code>
    </td>
    <td>
      <code>{'arn:aws:lambda:*::remotion-*'}</code>
    </td>
    <td>
      Allows for creating, deleting and deleting Lambda functions starting with <code>remotion-</code>. Allows for managing layers (responsible for delivering FFMPEG and Puppeteer binaries).
    </td>
  </tr>
  <tr>
    <td>
      <code>lambda:ListLayers</code> <br />
      <code>lambda:ListFunctions</code>
    </td>
    <td>
      <code>{'*'}</code>
    </td>
    <td>
      Allows for reading the metadata of all Lambdas and Lambda Layers in your account for finding Remotion-related resources.
    </td>
  </tr>
</table>
