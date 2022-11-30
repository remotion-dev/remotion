---
image: /generated/articles-docs-lambda-speed.png
id: optimizing-speed
title: Optimizing for speed
slug: /lambda/optimizing-speed
crumb: "Lambda"
---

On this page, a few strategies are presented for making a render on Lambda as fast as possible.

## Higher concurrency

Generally, a lower value for [`framesPerLambda`](/docs/lambda/rendermediaonlambda#framesperlambda) will result in higher concurrency and therefore an opportunity to finish the render in less absolute time. At the same time, more overhead will be produced, making the render more expensive. You will also experience diminishing returns, and adding too much concurrency can make the speed slower because the overhead of orchestrating many Lambda functions outweigh the gains.
See the [Lambda Concurrency](/docs/lambda/concurrency) page for more information.

## More memory

Adding more memory on Lambda will also scale up the CPU power on Lambda proportionally, therefore making the render faster. At the same time, the cost also linearly increases with the memory you add.

## `concurrencyPerLambda` property

The [`concurrencyPerLambda`](/docs/lambda/rendermediaonlambda#concurrencyperlambda) property in [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) allows you to open multiple browser tabs in a single Lambda function, therefore opening an opportunity to do more work at once. If the Lambda function is too busy, increasing the concurrency might also be counterproductive.

## Make the render more performant

See the [general performance tips](/docs/performance) which also apply to Lambda.

## See also

- [Optimizing for cost](/docs/lambda/optimizing-cost)
- [Performance](/docs/performance)
