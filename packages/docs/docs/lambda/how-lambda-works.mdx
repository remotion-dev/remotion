---
image: /generated/articles-docs-lambda-how-lambda-works.png
id: how-lambda-works
title: How Remotion Lambda works
crumb: 'Lambda'
---

This document describes the procedure that gets executed when a Remotion Lambda video render is triggered.

:::note
This document explains the Lambda architecture from version 4.0.165 on.  
Previously, Lambda functions did not use Response Streaming, and instead saved chunks to S3.
:::

<Step>1</Step> A single Lambda function is invoked using <a href="/docs/lambda/rendermediaonlambda">
  <code>renderMediaOnLambda()</code>
</a> - either directly or via the CLI which also calls this API. This invocation
is called the <strong>main function</strong>.<br />
<Step>2</Step> The main function visits the <a href="/docs/terminology/serve-url">
  Serve URL
</a> that it is being passed in a headless browser. <br />
<Step>3</Step> The main function finds the composition based on the composition ID
that was passed and runs the <a href="/docs/props-resolution">
  props resolution
</a> algorithm to determine the props that should be passed to the video as well
as the metadata (such as the duration in frames).<br />
<Step>4</Step> Based on the determined duration of the video and the <a href="/docs/lambda/concurrency">
  concurrency
</a>, several <strong>renderer functions</strong> are spawned, which are tasked to
render a portion of the video.<br />
<Step>5</Step> The renderer functions use <a href="https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/">
  AWS Lambda Response Streaming
</a> to report progress as well as the binary video chunks. <br />
<Step>6</Step> The main function concatenates the progress reports into a
concise <code>progress.json</code> file and periodically uploads it to S3.<br />
<Step>7</Step> The <a href="/docs/lambda/getrenderprogress">
  <code>getRenderProgress()</code></a> API queries the S3 bucket for the <code>progress.json</code> file and returns
the progress of the render.<br />
<Step>8</Step> As soon as all chunks have arrived in the main function, they
get <a href="/blog/faster-lambda">seamlessly concatenated</a>. The concatenation
algorithm is not a public API at the moment.<br />
<Step>9</Step> The main function uploads the final video to S3 and shuts down.

## FAQ

### Can I roll my own distributed renderer?

The seamless concatenation of chunks is not a public API at the moment.  
You may render chunks using [`frameRange`](/docs/renderer/render-media#framerange) and [`audioCodec: "pcm-16"`](/docs/renderer/render-media#audiocodec) which you can concatenate using FFmpeg.

Building a distributed renderer is hard, and not recommended for most.

### Will each chunk download all assets?

Each chunk will download all assets that are referenced in this chunk.  
This can lead to assets being downloaded many times at the same time, which may overwhelm a server or trigger rate limits.  
In addition, you pay for the bandwidth, even if the assets are on S3<sup>1)</sup>.

Keep this in mind when designing your solution and consider using a CDN to serve assets.

---

<sup>1)</sup> An API for avoiding the S3 bandwidth charge is <a href="https://github.com/remotion-dev/remotion/issues/3817">planned</a>.
