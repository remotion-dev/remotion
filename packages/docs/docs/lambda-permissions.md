---
sidebar_label: Permissions
title: Lambda - Permissions
---

## Required permissions

:::info
Currently outdated. Does not list all permissions. See `npx remotion-lambda policies user` and `npx remotion-lambda policies role` for the most up to date policy files.
:::

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
