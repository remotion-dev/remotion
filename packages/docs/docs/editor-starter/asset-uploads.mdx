---
image: /generated/articles-docs-editor-starter-asset-uploads.png
title: Asset uploads
sidebar_label: Asset uploads
id: asset-uploads
crumb: Editor Starter
---

If the user drops in any image, audio, video or GIF, they are uploaded to cloud storage so that rendering in the cloud can be performed later.  
By default, S3 is used for cloud storage, which requires some setup.

## Setup

- Visit the [S3 console](https://us-east-1.console.aws.amazon.com/s3/home?region=us-east-1).
- Create a new bucket.
  - Uncheck the "Block all public access" checkbox.
  - Switch the default setting and set **ACLs enabled** - if you don't do this, you will get a 400 error when later uploading assets.
- Within the created bucket, go to the "Permissions" tab and enter the following policy into the "CORS" section:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

- Go to [IAM -> "Users"](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users) in the AWS console.
  - **If you have already [setup rendering](/docs/editor-starter/rendering)**: Select the user you created.
  - **If you have not:** Create a new user with all settings left as default.
- Create a new user with all settings left as default.
- Click "Add permissions -> Add inline policy" and add the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Presign",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    }
  ]
}
```

:::note
Make sure to replace `YOUR_BUCKET_NAME` with the name of your bucket.
:::

- Click "Security credentials".
- Click "Create access key". Select "CLI" as use case.
- Save your access key and secret access key.

In your `.env` file, fill now the following variables:

```txt
REMOTION_AWS_ACCESS_KEY_ID=
REMOTION_AWS_SECRET_ACCESS_KEY=
REMOTION_AWS_REGION=
REMOTION_AWS_BUCKET_NAME=
```

:::note
Rename the `.env.example` file to `.env` to get a template.
:::

:::note
The same environment variables are also used for [rendering](/docs/editor-starter/rendering) in the cloud.
:::

Now, restart the Editor Starter.  
When you drop in an asset, it should be uploaded to the S3 bucket.

## Limits

The constant [`MAX_FILE_UPLOAD_SIZE_IN_MB`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MAX_FILE_UPLOAD_SIZE_IN_MB&type=code) limits the size of the file that can be uploaded. By default, it is set to 1000MB.

## S3 Transfer acceleration (recommended)

Loading the assets from S3 can be slow.  
To speed it up, you can enable Transfer acceleration for your S3 bucket:

- Go to the [S3 console](https://us-east-1.console.aws.amazon.com/s3/home?region=us-east-1).
- Select your bucket.
- Go to the "Properties" tab.
- Scroll down to the "Transfer acceleration" section.
- Click "Enable".
- Click "Save".

Then set the `REMOTION_AWS_TRANSFER_ACCELERATION` environment variable to `true` in your `.env` file.

## See also

- [Tracks, items and assets](/docs/editor-starter/tracks-items-assets)
- [Asset cleanup](/docs/editor-starter/asset-cleanup)
