---
slug: cloudrun
title: Remotion Cloud Run
author: Matt McGillivray
author_title: Freelance fullstack developer
draft: true
author_url: https://github.com/umungobungo
author_image_url: https://avatars2.githubusercontent.com/u/22192773?s=460&u=12eb94da6070d00fc924761ce06e3a428d01b7e9&v=4
---

Welcome to the release notes of a new way to render with Remotion on the cloud! With Remotion Cloud Run, you can now easily render within Google Cloud Platform.

## Streamlined Project Setup

It is not uncommon to see developers needing assistance in [Discord](https://remotion.dev/discord) after a few mis-clicks when setting up Remotion Lambda. For Cloud Run, there are only a few clicks to make in the console, before Terraform takes over to automate the setup process - enabling APIs, creating a role with the required permissions, and creating a Service Account to perform the rendering securely. It even creates your .env file to insert straight into your remotion project!

## Robust Rendering

For now, Remotion Cloud Run only supports a single-threaded rendering process. Remotion Lambda can offer greater speed by spinning up multiple functions and rendering chunks in parallel, before stitching them back together. This functionality can often come at a cost of reliability though, and depending on the product you are building, it may be more important to render reliably than to render faster.

## Easier to understand concurrency + instance limit

Does Lambda have zero concurrency?

When using AWS Lambda, you may have the situation of allowing multiple users to render videos at the same time, and need to calculate whether you have concurrency left on your account to allow another render. Remotion Lambda spins up multiple lambdas for rendering of chunks in parallel, and this needs to be taken into consideration for simultaneous render requests. In Remotion Cloud Run, you can easily set the instance limit to 100 (the default) and know that if 99 users request a render at the same time, you still have one service instance left.

## Higher Quota Limits

At the time of writing, here are the quota differences in GCP and AWS, and what that could mean for your product:

| Constraint        | AWS Limit  | GCP Limit  | Outcome                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Disk Size         | 10 GB      | 32 GB      | In GCP, you can render videos with a larger file size. File size increases as a combination of quality and video length. Lambda is further limited here due to distributed rendering requiring (generally speaking) a cop of all the chunks before they are stitched together. [This brings Lambda's output down to 5gb](/docs/lambda#limitations).                                        |
| Minimum Instances |            |            |                                                                                                                                                                                                                                                                                                                                                                                            |
| Maximum Timeout   | 15 minutes | 60 minutes | This is tricky to compare due to the nature of distributed rendering on Lambda vs. Cloud Run. As Cloud Run is performing all the rendering in one instance, this allows up to 60 minutes for the entire rendering process. For Lambda, each chunk has a maximum timeout of 15 minutes, but also the function that is performing the concatenation needs to be completed within 15 minutes. |

## Node API and CLI

Where possible, the Cloud Run package has aligned naming conventions. For CLI commands, this generally means replacing `lambda` with `cloudrun`, and `function` with `service`.

## Why choose Cloud Run over Lambda?

Where possible

## New documentation

- Cloud Run documentation
