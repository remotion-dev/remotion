---
image: /generated/articles-docs-distributed-rendering.png
id: distributed-rendering
title: Distributed rendering
crumb: 'Advanced rendering'
---

[Remotion Lambda](/docs/lambda) is our recommended solution if you are looking for a way to split up renders into chunks that run on different machines.

It takes care of a lot of engineering work that you would have to undergo yourself otherwise:

- Orchestrating the distributed render: Defining how work gets split up, keeping track of the progress, merging the chunks, saving it to cloud storage.
- Streaming chunks and progress over one connection to enable smooth progress progress reporting
- Bundling Chrome, Remotion binaries, necessary fonts and a custom Emoji font so they fit in a Lambda function.
- Cleaning up all the created resources after a function invocation to avoid memory leaks when functions are reused.
- Enabling logs, group them by renders and chunks, collect and surface errors, symbolicate stack traces to aid [debugging Lambda renders](/docs/lambda/troubleshooting/debug)
- Supporting multiple media types: Rendering videos, images, GIFs and audio
- Implementing retry mechanisms for nearly all AWS operations (invoking functions, reading and writing objects)
- Warning you about bad configuration (Resources, credentials, permissions, payloads)
- Working around Lambda payload size limits by saving them to S3
- Keeping browser instances open inbetween function invocations so they are ready on the next invocation, but un-referencing them so you don't get billed for it.
- Using special options to seamlessly concatenating video and audio without artifacts showing up
- Implementing clients for Node, Go, Ruby, Python and PHP
- Implementing Webhooks

## You might not want a custom distributed renderer

We think Lambda is the best balance between speed, cost, scalability and ease of use.

Many users are setting the memory too high for their Lambda cost and are unnecessarily causing their renders to be way too expensive.  
See how to [optimize a Lambda render](/docs/lambda/optimizing-cost).

Before proceeding with building your own distributed rendering solution, consider how much money you are going to save and weigh it against the cost of implementation, given the complexity.

Also consider how much savings you are getting by Lambda functions shutting down immediately after renders are finished.

## Implementing a distributed renderer

Should you have come to the conclusion that you still need a distributed rendering solution, here is how to do it.  
[Remotion Lambda](/docs/lambda) is following the same blueprint as well.

### 1. Splitting up the work

We're calling the machine which orchestrates the render the "main routine".

- You must first determine the length of the video that you want to render by calling [`selectComposition()`](/docs/renderer/select-composition).
- Consider the `frameRange` and `everyNthFrame` options if necessary to determine how many frames you are actually rendering.
- Decide on how many frames you want to render per chunk. **Every chunk must render the same amount of frames, except the last one.** Violating this rule might lead to audio artifacts if you are using the `aac` audio codec.
- Group the render into an array of ranges, which you will use as the [`frameRange`](/docs/renderer/render-media#framerange) argument when rendering chunks.  
  Remember that frame ranges start at `0`, and end at `durationInFrames - 1`. Passing values too small or too big will cause an error to be thrown.

### 2. Invoking render functions

- Invoke, in some way, some other machine which calls [`renderMedia()`](/docs/renderer/render-media).
- Pass the [`frameRange`](/docs/renderer/render-media#framerange) of this chunk that you have calculated before to your render call.
- Pass as the [`composition`](/docs/renderer/render-media#composition) the value you retrieved in the main routine.
- Pass any other options to the [`renderMedia()`](/docs/renderer/render-media) call, but you **must pass the same options for every chunk**.
- Ensure you are not caught by HTTP body payload limits that for example Lambda has. Otherwise, you might fail to invoke a render if the input props / resolved props payload is too big.
- Pass the same [`inputProps`](/docs/renderer/render-media#inputprops) that you passed to [`selectComposition()`](/docs/renderer/select-composition#inputprops).
- Set the [`numberOfGifLoops`](/docs/renderer/render-media#numberofgifloops) always to `null` for the chunk.
- Set the [`enforceAudioTrack`](/docs/renderer/render-media#enforceaudiotrack) option always to `true`.
- Set the [`outputLocation`](/docs/renderer/render-media#outputlocation) to a
- Set the [`compositionStart`](/docs/renderer/render-media#compositionstart) to the first frame of overall range of frames that are being rendered.
  - Example 1: If you are rendering a full composition, every [`renderMedia()`](/docs/renderer/render-media) invocation should have `0` as `compositionStart`.
  - Example 2: If your goal is to render a portion of a composition, say `frameRange: [100, 199]`, and you split this up into 4 chunks: `[100, 124], [125, 149], [150, 174], [175, 199]`, every chunk should have `100` as the value for `compositionStart`
- IF you want to render with the codec `h264` (default and recommended), or you want to render a GIF, **set the codec to `h264-ts` instead of `h264`**.
- IF you are rendering:
  - At least 4 frames per chunk AND
  - NOT with audio codec `aac` (which would be default and recommended),
- Then:
  - set the [`audioCodec`](/docs/renderer/render-media#audiocodec) to `pcm-16` instead of the audio codec.
  - set the [`forSeamlessAacConcatenation`](/docs/renderer/render-media#forseamlessaacconcatenation) option to `false`.
- Else:
  - Set the [`audioCodec`](/docs/renderer/render-media#audiocodec) to the same value you would pass to a regular [`renderMedia()`](/docs/renderer/render-media) call, which might be `null`.
  - set the [`forSeamlessAacConcatenation`](/docs/renderer/render-media#forseamlessaacconcatenation) option to `true`.
- If you are rendering audio, use the [`separateAudioTo`](/docs/renderer/render-media#separateaudioto) option to render the audio to a separate file.
- Handle [artifacts](/docs/artifacts) if desired and store them somewhere, or send them to the main routine.
- The parameters [`concurrency`](/docs/renderer/render-media#concurrency) and [`offthreadVideoThreads`](/docs/renderer/render-media#offthreadvideothreads) may be adjusted if desired, but leaving the defaults is also fine.

Following these instructions and passing the right values is crucial for aligning the audio correctly when concatenating it in the end.

Pass the video and audio chunks, and [artifacts](/docs/artifacts) that you have received, to the machine running the main routine.

### 3. Concatenate the chunks

Collect all the audio and video chunks. Once you have all of them, you can call [`combineChunks()`](/docs/renderer/combine-chunks) with the following parameters:

- [`videoFiles`](/docs/renderer/combine-chunks#videofiles): An array of absolute paths to video chunks, must be in order.
- [`audioFiles`](/docs/renderer/combine-chunks#audiofiles): An array of absolute paths to audio chunks, must be in order.
- [`outputLocation`](/docs/renderer/combine-chunks#outputlocation): An absolute file path where the combined chunks are stored.
- [`onProgress`](/docs/renderer/combine-chunks#onprogress): See documentation for `combineChunks()`.
- [`codec`](/docs/renderer/combine-chunks#codec): The final codec of the media. If you want to render `h264`, you should now pass `h264`, not `h264-ts`.
- [`framesPerChunk`](/docs/renderer/combine-chunks#framesperchunk): The amount of frames that were rendered per chunk. The `everyNthFrame` option will be applied only afterwards, so don't calculate it in.
- [`fps`](/docs/renderer/combine-chunks#fps): Must be the value of `fps` that you got from [`selectComposition`](/docs/renderer/select-composition).
- [`preferLossless`](/docs/renderer/combine-chunks#preferlossless): Pass it here as well if you passed it to `renderMedia()`.
- [`compositionDurationInFrames`](/docs/renderer/combine-chunks#compositiondurationinframes): The total duration of the composition, taken from [`selectComposition()`](/docs/renderer/select-composition). Pass the full duration even if you are only rendering a portion of it.
- [`frameRange`](/docs/renderer/combine-chunks#framerange): If you only rendered a portion of a composition, then you must pass that exact frame range here as well. Remember that frame ranges start at `0`, and end at `durationInFrames - 1`. Passing values too small or too big will cause an error to be thrown.

If you have changed the defaults of a [`renderMedia()`](/docs/renderer/render-media) call, you may also have to pass additional parameters:

- [`audioCodec`](/docs/renderer/combine-chunks#audiocodec): If you passed a custom `audioCodec` to the render routines, then you should also pass it here. Otherwise, should be `null`. If the default for the video codec would have been `aac` and you passed `pcm-16` to the render routine, you can now pass `null` again.
- [`audioBitrate`](/docs/renderer/combine-chunks#audiobitrate): The bitrate that you would target. Since you might have rendered
- [`numberOfGifLoops`](/docs/renderer/combine-chunks#numberofgifloops): If you are rendering a GIF, you can now set the number of loops (remember that for each chunk it must be `null`)
- [`everyNthFrame`](/docs/renderer/combine-chunks#everynthframe): If you passed it to each [`renderMedia()`](/docs/renderer/render-media) call, pass it here again.

Furthermore, you can use the [`logLevel`](/docs/renderer/combine-chunks#loglevel), [`metadata`](/docs/renderer/combine-chunks#metadata), [`cancelSignal`](/docs/renderer/combine-chunks#cancelsignal) and [`binariesDirectory`](/docs/renderer/combine-chunks#binariesdirectory) options as you would use with [`renderMedia`](/docs/renderer/render-media).

## See also

- [`combineChunks`](/docs/renderer/combine-chunks)
- [`renderMedia`](/docs/renderer/render-media)
- [`selectComposition`](/docs/renderer/select-composition)
