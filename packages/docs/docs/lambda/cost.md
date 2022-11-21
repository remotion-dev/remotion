---
id: optimizing-cost
title: Optimizing for cost
slug: /lambda/optimizing-cost
---

On this page, a few strategies for optimizing the cost of using Remotion Lambda are presented.

## Lower concurrency

A lot of compute time is spent on warming up the Lambda function, opening browsers, uploading and downloading assets. By using less Lambda functions, less overhead is being produced which will ultimately result in lower cost, however also in slower render speeds. See the [Lambda Concurrency](/docs/lambda/concurrency) page for more information.

## Using cheaper regions

Not all AWS regions have the same cost. See the [AWS Lambda](https://aws.amazon.com/lambda/pricing/) pricing chart to see if you are using a region that is more expensive.

## Pre-compute data

Consider whether your computation will run on every invoked Lambda function. If possible, pre-compute data once and pass it as [input props](/docs/parametrized-rendering#input-props) to the render.

## Make the render more performant

Making your render more efficient will also reduce the cost of using Lambda. See the [general performance tips](/docs/performance)

## See also

- [Performance](/docs/performance)
