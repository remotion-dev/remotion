---
id: ssr
title: Server-Side Rendering
---

Remotion's rendering engine is built upon Node.JS, which makes it exceptionally easy to render a video in the cloud.

Since Remotion is built with tech (_Node.JS, FFMPEG, Puppeteer_) that works well cross-platform, you can without much hassle run it on a Linux-based system or even dockerize your video.

On this page, we demonstrate the server-rendering capabilities or Remotion using examples [built into the template](/docs#installation)!

## Render a video programmatically

The NPM package `@remotion/renderer` provides you with an API for rendering the videos programmatically. You can make a video in three steps: creating a Webpack bundle, rendering the frames, and stitching them together to an MP4. This gives you more independence and allows you to for example skip the stitching process, if you just want a PNG sequence.

Follow this commented example to see how to render a video:

```tsx
import fs from 'fs';
import {evaluateRootForCompositions} from 'remotion';
import {bundle} from '@remotion/bundler';
import {
	getCompositions,
	renderFrames,
	stitchFramesToVideo,
} from '@remotion/renderer';

const start = async () => {
  // The composition you want to render
  const compositionName = 'HelloWorld';

  // Create a webpack bundle of the entry file.
  const bundled = await bundle(require.resolve('./src/index'));

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundled);

  // Select the composition you want to render.
  const video = comps.find((c) => c.id === compositionName);

  // We create a temporary directory for storing the frames
  const framesDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'remotion-')
  );

  // We create PNGs for all frames
  await renderFrames({
    config: video,
    // Path of the webpack bundle you have created
    webpackBundle: bundled,
    // Get's called after bundling is finished and the
    // actual rendering starts.
    onStart: () => console.log('Rendering frames...'),
    onFrameUpdate: (f) => {
      // Log a message whenever 10 frames have rendered.
      if (f % 10 === 0) {
        console.log(`Rendered frame ${f}`);
      }
    },
    // How many CPU threads to use. `null` will use a sane default (half of the available threads)
    // See 'CLI options' section for concurrency options.
    parallelism: null,
    outputDir: framesDir,
    // React props passed to the root component of the sequence. Will be merged with the `defaultProps` of a video.
    userProps: {
      titleText: 'Hello World'
    },
    videoName: compositionName,
  });

  // Add this step if you want to make an MP4 out of the rendered frames.
  await stitchFramesToVideo({
    // Input directory of the frames
    dir: tmpDir,
    // Overwrite existing video
    force: true,
    // Possible overwrite of video metadata,
    // we suggest to just fill in the data from the
    // video variable
    fps: video.fps,
    height: video.height,
    width: video.width,
    // Pass in the desired output path of the video. Et voilà!
    outputLocation: path.join(tmpDir, 'out.mp4'),
  });
};

start();
```

[See also: Passing props in Github Actions](parametrized-rendering#passing-props-in-github-actions)

## Render using a HTTP server

In the [template](/docs#installation), we added a minimal example of an HTTP server that dynamically returns a video whenever you call the URL.

The server is located under `server.tsx`, and you can run it using `npm run server`. Call the default URL with parameters, and it will return a video after some time! Try it out in the browser or using cURL:

```bash
curl "http://localhost:8000?titleText=Hello,+World!&titleColor=red" > output.mp4
```

Note that we only added a minimal example. For production, you should consider adding a queueing system and rate limiting.

## Render using a HTTP server (Dockerized)

We added a Dockerfile that includes FFMPEG and added it to the template. That means you can also run the server described in the section above using Docker.

```bash
docker build -t my-video .
docker run -p 8000:8000 my-video
```

## Render using Github Actions

The template includes a Github Actions workflow file
under `.github/workflows/render-video.yml`. All you have to do is to adjust the props that your root component accepts in the workflow file and you can render a video right on Github.

1. Commit the template to a Github repository
2. On Github, click the 'Actions' tab.
3. Select the 'Render video' workflow on the left.
4. A 'Run workflow' button should appear. Click it
5. Fill in the props of the root component and click 'Run workflow'.
6. After the rendering is finished, you can download the video under 'Artifacts'.

Note that running the workflow may incur costs. However, the workflow will only run if you actively trigger it.

[See also: Passing props in Github Actions](parametrized-rendering#passing-props-in-github-actions)
