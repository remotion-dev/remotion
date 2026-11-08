# Video matting

Use `@remotion/video-matting` to separate a source video into an opaque base and
a foreground WebM with transparency. Process the source once and reuse the
outputs in compositions; do not run the model during frame rendering.

## Generate the layers

Reuse an existing foreground if it was generated from the same source and has
matching timing and dimensions.

In Remotion Studio, select a video and choose **Remove background**. This
replaces its source with a transparent WebM. Duplicate the layer first when
the original video is needed underneath. Agents with Studio WebMCP access can
also use `remove_video_background`.

For local files in Node.js:

1. Install `@remotion/video-matting`, `@huggingface/transformers`, `mediabunny`,
   and `@mediabunny/server` with `remotion add` using the project's package manager.
2. Call `registerMediabunnyServer()` from `@mediabunny/server` before processing.
3. Choose `modnet` for people. Use the experimental `ben2-base` model for general
   foreground subjects; it requires more GPU memory and fp16 support.
4. Call `canUseVideoMatting({model})`. If unsupported, report its `detailedReason`
   instead of promising a result. A compatible GPU is required.
5. Call `downloadVideoMattingModel({model})`, then
   `separateVideoLayers({src, model, audio: 'base'})`. `src` may be a local path.
6. Retrieve each output with `base.getBlob()` and `foreground.getBlob()` and
   write the bytes to `.webm` files in `public/`. Dispose the outputs after
   saving them. Call `disposeVideoMattingModel({model})` when no more processing
   is needed.

See the [Node.js setup](https://www.remotion.dev/docs/video-matting/node) and
[`separateVideoLayers()` reference](https://www.remotion.dev/docs/video-matting/separate-video-layers)
for output streams, progress reporting, and disposal APIs. Custom output streams
must honor each chunk's `position`; writes are not necessarily append-only.

## Compose the result

Use `<Video>` from `@remotion/media` for both layers and `staticFile()` for saved
assets. JSX order determines stacking, from back to front:

- **Text behind a subject:** original or base video, an `Interactive.Div` with
  editable text, then the foreground.
- **Background blur:** original or base video with `blur()` from
  `@remotion/effects/blur`, then the sharp foreground.
- **Background replacement:** a new background, then the foreground. Omit the
  original video.
- **Subject-only effects:** apply effects such as `glow()`, `dropShadow()`, or
  `colorCorrection()` to the foreground. Keep the original video underneath
  when its background should remain visible.

The base still contains the subject. Matting does not reconstruct what was
hidden behind it; strong background blur may leave a halo around the subject.

Keep both layers' position, dimensions, `objectFit`, cropping, `from`,
`trimBefore`, `durationInFrames`, and `playbackRate` aligned. Play the original
audio once: mute the foreground when the base has audio. For replacement
backgrounds, use `audio: 'foreground'` during separation or add the original
audio separately. Preserve the foreground's alpha-capable WebM format.

Preview the composition and scrub through motion to check synchronization and
the edges of hair or moving objects. See the
[video matting guide](https://www.remotion.dev/docs/video-matting-guide) for
complete composition examples.
