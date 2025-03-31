---
image: /generated/articles-docs-troubleshooting-no-frame-found-at-position.png
id: no-frame-found-at-position
sidebar_label: No frame found at position
title: No frame found at position error message
crumb: 'Troubleshooting'
---

If you get an error:

```sh
Compositor error: No frame found at position 64512 for source /tmp/remotion-assetsynpc3sc0cn/remotion-assets-dir/9569510174915195.mp4 (original source = https://remotion.dev). If you think this should work, file an issue at https://remotion.dev/report or post it in https://remotion.dev/discord. Post the problematic video and the output of `npx remotion versions`.\n   0: <remotion::errors::ErrorWithBacktrace as core::convert::From<std::io::error::Error>>::from\n   1: remotion::ffmpeg::extract_frame\n   2: remotion::thread::WorkerThread::run_on_thread\n   3: std::sys::backtrace::__rust_begin_short_backtrace\n   4: core::ops::function::FnOnce::call_once{{vtable.shim}}\n   5: std::sys::pal::unix::thread::Thread::new::thread_start\n   6: start_thread\n   7: thread_start\n\n    at onMessage (/var/task/index.js:106757:41)\n    at processInput (/var/task/index.js:63575:9)\n    at Socket.onData (/var/task/index.js:63597:9)\n    at Socket.emit (node:events:518:28)\n    at addChunk (node:internal/streams/readable:559:12)\n    at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)\n    at Readable.push (node:internal/streams/readable:390:5)\n    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)\n    at onMessage (/var/task/index.js:106757:41)\n    at processInput (/var/task/index.js:63575:9)\n    at Socket.onData (/var/task/index.js:63597:9)\n    at Socket.emit (node:events:518:28)\n    at addChunk (node:internal/streams/readable:559:12)\n    at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)\n    at Readable.push (node:internal/streams/readable:390:5)\n    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)
```

It means that the cache which is kept for serving frames for [`<OffthreadVideo>`](/docs/offthreadvideo) has failed to serve a frame for the given position.

## To little memory available

The most likely cause is that the memory available for the OffthreadVideo cache is too small and any frames that are being extracted are being evicted from the cache immediately.

Consider increasing the memory available of your machine, or allowing the OffthreadVideo cache to be bigger by setting the [`offthreadVideoCacheSizeInBytes`](/docs/renderer/render-media#offthreadvideocachesizeinbytes) prop to a higher value. Only set this to a value that is lower than the memory actually available, otherwise the system might kill the process.

## Video has a gap

Another reason might be that the video has a gap in the frames that are being extracted.  
For example, a screen recording that does not have any movement for a few seconds usually keeps a gap in the video file where there are no frames.

OffthreadVideo currently struggles with these types of videos as the closest frame has too much of a deviation from the requested time.

In this case, we recommend to consult with the Remotion team by filing an issue on [GitHub](https://remotion.dev/issue) and submitting the [video](https://remotion.dev/report).
