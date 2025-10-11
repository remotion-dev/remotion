---
image: /generated/articles-docs-lambda-ruby.png
title: Triggering renders from Ruby
slug: /lambda/ruby
sidebar_label: Rendering from Ruby
crumb: '@remotion/lambda'
---

_available from v4.0.232_

To trigger a Lambda render using Ruby, install the [`remotion_lambda`](https://rubygems.org/gems/remotion_lambda) gem.  
The version should be the same version of the `@remotion/lambda` NPM package version that you used to deploy your function.

## Notes

- This module is experimental and might have breaking changes in minor versions. Check on this page for up-to-date examples.
- The implemented methods are [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda) and [`getRenderProgressOnLambda()`](/docs/lambda/getrenderprogress).
- We will maintain the Ruby SDK to ensure the fields stay in sync with the Node.js functions.
- The fields in the input payload are `snake_case` versions of the Node.js field names.
- Nested field names, e.g. `s3_output_provder.accessKeyId` have the original `camelCase` capitalization.
- All fields of the response payloads are in `camelCase` like the original Node.js functions.
- The maximum input payload size is around 60KB. The workaround for bigger payloads where they get uploaded to S3 is not implemented in the Ruby SDK.

## Rendering a video and getting the progress

```rb title="Rendering a video from Ruby"
require 'remotion_lambda'

client = RemotionLambda::Client.new(
  region: 'eu-central-1',
)

function_name = ENV.fetch('REMOTION_APP_FUNCTION_NAME')

payload = get_render_media_on_lambda_payload(
  composition: "still-helloworld",
  download_behavior: {
    type: "play-in-browser",
  },
  codec: "h264",
  input_props: {
    message: "Hello from props!",
  }
)

res = client.render_media_on_lambda(function_name, payload)
puts res
while true
  render_progress_payload = get_render_progress_payload(
    render_id: res["renderId"],
    bucket_name: res["bucketName"],
  )
  progress = client.get_render_progress(function_name, render_progress_payload)
  puts progress["overallProgress"]
  break if progress["done"]
  break if progress["fatalErrorEncountered"]
  sleep 1
end
```

## Rendering a still

```ruby title="Rendering a still from Ruby"
require 'remotion_lambda'

client = RemotionLambda::Client.new(
  region: 'eu-central-1',
)

function_name = ENV.fetch('REMOTION_APP_FUNCTION_NAME')

payload = get_render_still_on_lambda_payload(
  composition: "still-helloworld",
  input_props: {
    message: "Hello from props!",
  }
)

res = client.render_still_on_lambda(function_name, payload)
puts res
```

## See also

- [Ruby gem `remotion_lambda`](https://rubygems.org/gems/remotion_lambda)
- [Source code for this SDK](https://github.com/remotion-dev/remotion/tree/main/packages/lambda-ruby)
