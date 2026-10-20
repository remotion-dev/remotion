# @remotion/serverless

A runtime for distributed rendering

## Usage

This is an internal package and has no documentation.

## Writing an adapter

`@remotion/serverless-client` and `@remotion/serverless` contain the provider-agnostic rendering pipeline. A cloud provider (AWS Lambda today; e.g. Google Cloud, Cloudflare or Azure in the future) is plugged in by implementing three objects. `@remotion/lambda-client` and `@remotion/lambda` are the reference implementation.

### 1. `CloudProvider` (type only, `@remotion/serverless-client`)

Describes the provider-specific types that flow through the generic code:

- `region`: the union of supported regions.
- `receivedArtifactType`: extra fields on an emitted artifact (AWS adds `s3Url` and `s3Key`).
- `creationFunctionOptions`: extra options for creating a function.
- `storageClass`: the storage classes of the object store.
- `requestHandler`: an opaque request handler passed to every storage/function call.

### 2. `ProviderSpecifics<Provider>` (`@remotion/serverless-client`)

Runs both in the client and inside the function. Groups of hooks:

- Object storage: `getBuckets`, `createBucket`, `bucketExists`, `applyLifeCycle`, `listObjects`, `readFile`, `writeFile`, `writeFileIfNotExists`, `supportsConditionalOutput`, `headFile`, `deleteFile`, `getBucketPrefix`, `getBucketListingUrl`.
- Function invocation: `callFunctionSync`, `callFunctionAsync`, `callFunctionStreaming`, `getRendererFunctionTransport`, `getFunctions`, `deleteFunction`, `parseFunctionName`, `isFlakyError`.
- Pricing: `estimatePrice`, `getBillingCurrency`, `getEphemeralStorageForPriceCalculation`.
- URLs: `convertToServeUrl`, `getOutputUrl`, `getLoggingUrlForMethod`, `getLoggingUrlForRendererFunction`, `getDocsUrl`.
- User-facing text: `names` (API, option, package and product names used in messages), `getErrorExplanation` (provider-specific error hints).
- Misc: `getChromiumPath`, `randomHash`, `validateDeleteAfter`, `checkCredentials`, `getAccountId`, payload size limits, `printLoggingHelper`.

`getRendererFunctionTransport()` decides how a renderer function returns its chunk: `'response-streaming'` streams it back over the invocation response, `'storage'` writes it to the bucket and lets the launch function poll for it. Use `'storage'` where response streaming is not available.

### 3. `InsideFunctionSpecifics<Provider>` (`@remotion/serverless`)

Runs only inside the deployed function: browser lifecycle, temp dir handling, current function name / memory / region, webhook invocation, artifact details, diagnostics.

### 4. `FullClientSpecifics<Provider>` (`@remotion/serverless`)

Deployment-time helpers used by the full (Node.js) client: bundling a site, uploading a directory, creating a function.

### Wiring it together

Inside the function, dispatch every invocation to `innerHandler()` / `innerRoutine()` with a `ResponseStreamWriter`. On the client, call `callFunctionSync/Async/Streaming` with payloads from `ServerlessPayloads<Provider>` and read progress with `getProgress()`.

### Known provider-specific leftovers

The following are still shaped after AWS and are kept for Lambda's public API and the wire format shared with the non-JS Lambda SDKs. Other adapters can ignore or pass through these values:

- `forcePathStyle`, `expectedBucketOwner` and `skipPutAcl` on storage calls and payloads (S3 concepts).
- `CustomCredentials` / `s3OutputProvider` for rendering to a custom S3-compatible endpoint.
- Persisted and public field names such as `framesPerLambda`, `concurrencyPerLambda`, `lambdasInvoked`, `lambdaErrors` and `s3Location`.
