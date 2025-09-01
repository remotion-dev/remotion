---
image: /generated/articles-docs-media-parser-media-parser-controller.png
id: media-parser-controller
title: mediaParserController()
slug: /media-parser/media-parser-controller
crumb: '@remotion/media-parser'
---

:::warning
[We are phasing out Media Parser and are moving to Mediabunny](/blog/mediabunny)!
:::

Pass `mediaParserController()` to [`controller`](/docs/media-parser/parse-media#controller) to steer the `parseMedia()` function.

Each `mediaParserController` can only be attached to 1 [`parseMedia()`](/docs/media-parser/parse-media) call.

```tsx twoslash title="Use mediaParserController()"
import {mediaParserController, parseMedia} from '@remotion/media-parser';

const controller = mediaParserController();

parseMedia({
  src: 'https://www.w3schools.com/html/mov_bbb.mp4',
  controller,
});

// Pause
controller.pause();

// Resume
controller.resume();

// Abort
controller.abort();
```

## API

This function returns an object that can be passed to [`parseMedia({controller})`](/docs/media-parser/parse-media#controller).

It has the following methods:

### `pause()`

Pauses the download and parsing process.

### `resume()`

Resumes the download and parsing process.

### `abort()`

Aborts the download and parsing process.

### `seek(timeInSeconds: number)`

[Seeks to the best keyframe](/docs/media-parser/seeking) that comes before the time you specified.

### `getSeekingHints()`

Returns a promise that resolves to the [seeking hints](/docs/media-parser/seeking-hints).

### `addEventListener()`

See events below.

### `removeEventListener()`

See events below.

## Events

You can attach event listeners to the object returned by `mediaParserController()`.

```tsx twoslash title="Use events"
import {mediaParserController, parseMedia} from '@remotion/media-parser';

const controller = mediaParserController();

const onPause = () => {
  console.log('Paused');
};

const onResume = () => {
  console.log('Resumed');
};

controller.addEventListener('pause', onPause);
controller.addEventListener('resume', onResume);

// Make sure to cleanup later:
controller.removeEventListener('pause', onPause);
controller.removeEventListener('resume', onResume);
```

It also emits the following events:

### `pause`

Emitted when the download and parsing process is paused.

### `resume`

Emitted when the download and parsing process is resumed.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-parser/src/media-parser-controller.ts)
- [Pause, resume and abort parsing](/docs/media-parser/pause-resume-abort)
- [`parseMedia()`](/docs/media-parser/parse-media)
