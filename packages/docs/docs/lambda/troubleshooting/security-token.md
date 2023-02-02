---
image: /generated/articles-docs-lambda-troubleshooting-security-token.png
sidebar_label: Security token is invalid
title: '"The security token included in the request is invalid"'
crumb: "Lambda"
---

Some regions that are supported by Remotion are not enabled by default in an AWS account.

If you get a message:

```
The security token included in the request is invalid
```

it means the region is not enabled in your AWS account.

## Option 1: Enable the regions

Go to the AWS console, then:

- <Step>1</Step> Click on your name at the top right
- <Step>2</Step> Click `Account`
- <Step>3</Step> Enable the regions that you would like to use.

## Option 2: Make `getRegions()` return only regions by default

Use the [`enabledByDefaultOnly`](/docs/lambda/getregions#enabledbydefaultonly) option.

## See also

- [Region selection](/docs/lambda/region-selection)
