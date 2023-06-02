---
image: /generated/articles-docs-timeline.png
title: Preview your video
id: timeline
crumb: "Timeline basics"
---

You can start preview your video using:

```bash
npm start
```

This is a shorthand for the [`studio`](/docs/cli/studio) command of the [Remotion CLI](/docs/cli):

```bash
npx remotion studio
```

A server will be started on port `3000` (or a higher port if it isn't available) and the Remotion Studio should open in the browser.

<img src="/img/timeline.png"></img>

## Playback controls

Use the <svg
aria-hidden="true"
focusable="false"
data-prefix="fas"
data-icon="play"
className="svg-inline--fa fa-play fa-w-14"
role="img"
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 448 512" style={{height: 16, width: 16}}><path
    fill="currentColor"
    d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
  /></svg> button or <kbd>Space</kbd> to play your video.

Use the <svg viewBox="0 0 448 512" style={{height: 18, width: 18}}><path fill="currentColor" d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z" /></svg>
and <svg viewBox="0 0 448 512" style={{height: 18, width: 18}}><path fill="currentColor" d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z" /></svg> buttons to jump 1 frame backwards or forwards. You can also use the left arrow or right arrow to do so. If you hold the <kbd>Shift</kbd> key, you jump 1 second at a time.

## Toggling transparency mode

By default, the background of your video is a checkerboard pattern signifying that the pixels are transparent. You can press <svg viewBox="0 0 512 512" style={{width: 16, height: 16}}> <path d="M480 0H32A32 32 0 0 0 0 32v448a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32V32a32 32 0 0 0-32-32zm-32 256H256v192H64V256h192V64h192z" fill="currentcolor"/></svg> button to disable this behavior which will render a black background.

## In / Out Markers

Use the <svg viewBox="0 0 256 256" fill="none" style={{width: 16, height: 16}}><path d="M158 25H99V230.5H158" stroke="currentcolor" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round"/></svg> and <svg viewBox="0 0 256 256" fill="none" style={{width: 16, height: 16}}><path d="M98 25H157V230.5H98" stroke="currentcolor" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round"/></svg> buttons to set an In or Out marker. When you play the video again, only the range within the markers will play.  
To clear a marker, make sure your playback head is at the point of a marker and press the button you pressed to activate it again.

You may also use the keyboard shortcuts:

- <kbd>I</kbd>: Set an in marker
- <kbd>O</kbd> (the letter "O"): Set an out marker
- <kbd>X</kbd>: Clear both markers.

## Change the canvas size

By default the video scales to fit in the preview window.  
You can:

- Pinch to zoom
- Hold <kbd>Shift</kbd> and use the scrollwheel or
- Use the dropdown that says `Fit`

to change the size of the canvas.

## Change the playback speed

By default the video will play with 1x speed. You can speed up or slow down the video by clicking on the dropdown that says `1x`.

You may also choose a negative value which will play the video in reverse. Note that [`<Audio/>`](/docs/audio) and [`<Video/>`](/docs/video) tags cannot be played in reverse, this is a browser limitation.

## Render a composition

Click on the `Render` button or press <kbd>R</kbd> to open the Render dialog from where you can adjust settings and render your composition.

If you are using `In / Out Markers`, the render dialog will automatically set the `Start Frame` and `End Frame` to your selected markers.

## Quick Switcher

Use <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> to access the Quick Switcher to quickly change compositions.  
Start your input with `>` to switch to the command palette.  
Start your input with `?` to search the documentation.

## Advanced playback controls

Use the <kbd>J</kbd>, <kbd>K</kbd>, <kbd>L</kbd> keys to quickly move around the timeline while your video is playing.

<kbd>L</kbd> will play the video forward, pressing it repeatedly will play it faster.
<br />

<kbd>J</kbd> will play the video backwards, pressing it repeatedly will play it faster.
<br />

<kbd>K</kbd> will pause the video and reset the speed to 1x.

## Keyboard shortcuts and help

Press <kbd>?</kbd> to open the help dialog which shows you all available keyboard shortcuts. In the opened dialog, enter a search term to search our vast documentation.
