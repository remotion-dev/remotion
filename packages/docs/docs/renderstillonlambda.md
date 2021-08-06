---
id: renderstillonlambda
title: renderStillOnLambda()
slug: /lambda/renderstillonlambda
---

Renders a still image inside a lambda function and writes it to the specified output location.

If you want to render a video instead, use [`renderVideoOnLamda()`](/docs/lambda/rendervideoonlambda) instead.

If you want to render a still locally instead, use [`renderStill()`](/docs/renderstill) instead.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import {renderStillOnLambda} from '@remotion/lambda';
// ---cut---

const {
  estimatedPrice,
  url,
  size
} = await renderStillOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  composition: 'MyVideo',
  inputProps: {},
  imageFormat: 'png',
  maxRetries: 3,
  privacy: 'public',
  envVariables: {},
  frame: 10
})
```

## Arguments

An object with the following properties:

### `region`

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `functionName`

The name of the deployed Lambda function.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deployProject()`](/docs/lambda/deployproject) to deploy a Remotion project.

### `composition`

The name of the [composition](/docs/composition) you want to render..

### `inputProps`

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `imageFormat?`

_optional - default _

The image format that you want
