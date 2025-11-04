---
image: /generated/articles-docs-lambda-separate-environments.png
id: separate-environments
title: Separating production and testing environments
sidebar_label: Separating environments
slug: /lambda/separate-environments
---

The code that is inside the Lambda function is always the same, no matter if you are calling it from a local, staging or production environment.

Also, each render executed with Remotion Lambda is completely isolated from another, in terms of compute and storage.

## Functions

Each Lambda function has a configuration that determines its unique name:

- Timeout
- Memory size
- Disk size
- Remotion version

If you have the same configuration in different environments, you can safely re-use the same function since each execution is isolated – in fact, duplicating the function is not supported because it achieves nothing.

If you are changing the configuration in one environment, deploy a new function and leave the old one deployed.  
This allows you to safely test new functions without breaking the other environments.  
You don't incur any costs for functions that are deployed but not used.

## Sites

We recommend to scope the site to a specific environment using [`--site-name`](/docs/lambda/cli/sites/create#--site-name) when creating a site. For example, use `--site-name=remotion-production` and `--site-name=remotion-staging`.

A site contains your React / Remotion code and might change frequently.  
Make sure to update your site whenever you make changes to your code or upgrade Remotion, and to not use the site for other environments if they differ.

## Buckets

Just one bucket per region can be used for Remotion Lambda, but the resources in it can be scoped.

A bucket contains 2 folders:

- `sites/` folder for your sites
- `renders/` folder for your renders

You should [scope your sites](#sites) option when creating a site.  
The renders are automatically scoped when rendering by creating subfolders with unique IDs within the `renders/` folder.

It is safe to use the same bucket for all environments.  
Use the [`privacy`](/docs/lambda/rendermediaonlambda#privacy) option to make renders private.  
The sites must be public because they are accessed via HTTP.

## Common questions

### Why can't I rename the function?

- The [`npx remotion lambda render`](/docs/lambda/cli/render) command looks for functions that match this convention.
- With the default user policy, Remotion Lambda restricts itself from accessing functions that don't match this convention.
- You can use the [`speculateFunctionName()`](/docs/lambda/speculatefunctionname) function save one API call.
- The function is more likely to be warm from a previous invocation if you only have 1 function with the same configuration.
- There is no benefit to renaming the function.

### What if I want to have two functions for two different projects?

A function is not tied to a project.

Each function is a binary that contains the same code.  
Every Remotion Lambda user runs the exact same code in their function.

The React code you write is not contained in the function, it is hosted on the Serve URL.

Each function invocation is isolated and they cannot conflict each other. There is a [concurrency limit](/docs/lambda/troubleshooting/rate-limit#default-concurrency-limits), but it is per region, not per function.

### I need to separate production, staging and development

Function invocations don't conflict each other.  
Functions also don't contain any code that you write, they are binary and every Remotion Lambda user runs the exact same code.

It is impossible for a bad staging deployment to affect the production function.  
Therefore, we recommend to use the same function for all environments.

### I want to have different configurations for different functions

This is supported! You can have multiple functions with different configurations.  
It is only not possible to have multiple functions that share the exact same configuration:

- Timeout
- RAM
- Region
- Disk size
- Remotion version

To distinguish which function should be used, pass the function name explicitly to [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).  
You can pass [`--function-name`](/docs/lambda/cli/render#--function-name) to [`npx remotion lambda render`](/docs/lambda/cli/render)

### I want to deploy multiple projects

It is possible deploy multiple sites under different [Serve URLs](/docs/terminology/serve-url).  
This convention only applies to functions, which do not contain any code that you write.

### I want to deploy multiple functions to load-balance between them

You do not need to do this, because you can invoke a function multiple times concurrently.  
There is no concurrency limit per function, but a concurrency limit per region and account.  
Therefore there is no benefit in having multiple identical functions in the same region and account for load-balancing.

## See also

- [Function naming convention](/docs/lambda/naming-convention)
- [Upgrading Remotion Lambda](/docs/lambda/upgrading)
