---
image: /generated/articles-docs-timeline.png
title: Preview your video
id: timeline
crumb: "Timeline basics"
---

You can start the preview server of Remotion using

```sh
npm start
```

This is a shorthand for

```bash
npx remotion preview
```

A server will be started on port 3000 (or 3001 if it's not available, and so on) and the preview should open in the browser.

<img src="/img/timeline.png"></img>

## Preview controls

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

By default, the background of your video is a checkerboard pattern signifying that the pixels are transparent. You can press <svg viewBox="0 0 512 512" style={{width: 16, height: 16}}> <path d="M480 0H32A32 32 0 0 0 0 32v448a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32V32a32 32 0 0 0-32-32zm-32 256H256v192H64V256h192V64h192z"/></svg> button to disable this behavior which will render a black background.

## In / Out Markers

Use the <svg viewBox="0 0 256 256" fill="none" style={{width: 16, height: 16}}><path d="M158 25H99V230.5H158" stroke="black" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round"/></svg> and <svg viewBox="0 0 256 256" fill="none" style={{width: 16, height: 16}}><path d="M98 25H157V230.5H98" stroke="black" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round"/></svg> buttons to set an In or Out marker. When you play the video again, only the range within the markers will play.

You may also set markers using the <kbd>I</kbd> and <kbd>O</kbd> keys.

To clear a marker, make sure your playback head is at the point of a marker and press the button you pressed to activate it again. Or use the <kbd>X</kbd> key to clear both markers.

## Change the canvas size

The default scaling mode is "Fit", which will scale the video so it fits in the preview window. Use the left dropdown to choose a different scale.

## Change the playback speed

By default the video will play with 1x speed. You can speed up or slow down the video by clicking on the dropdown that says `1x`.

You may also choose a negative value which will play the video in reverse. Note that [`<Audio/>`](/docs/audio) and [`<Video/>`](/docs/video) tags cannot be played in reverse, this is a browser limitation.

## Advanced playback controls

Use the <kbd>J</kbd>, <kbd>K</kbd>, <kbd>L</kbd> keys to quickly move around the timeline while your video is playing.

<kbd>L</kbd> will play the video forward, pressing it repeatedly will play it faster.<br/>

<kbd>J</kbd> will play the video backwards, pressing it repeatedly will play it faster.<br/>

<kbd>K</kbd> will pause the video and reset the speed to 1x.

## Timeline modes

At the bottom of the Remotion preview player, you will see a timeline.
Remotions timeline has two modes: **Simple timeline** (_default_) and **Rich timeline** (experimental, will become default in the future).

You may switch between the two modes by clicking the icon with the three lines:

<img src="/img/timeline-toggle.png"></img>

### Simple timeline

The **simple timeline** will visualize the content that is rendered by your composition at the current time. This is a simple and efficient way of visualizing your content, as it will only render what you anyway see in the top panel of the editor. However, it is limited: If you place your cursor outside the time range of a sequence, Remotion cannot gather information about that sequence because it simply is not rendered at this time. This means that while the playback head is moving, the timeline may change.

### Rich timeline

The **rich timeline** will render additional frames to gather enough information to visualize a full timeline.
Sequences which are normally not rendered because the playback head is not within the time range of the sequence, will appear because Remotion is doing an additional render at a time where the sequence is visible.

These additional renders will appear as thumbnails in the timeline. Therefore, these thumbnails are only available in rich timeline mode.

### Which mode should I use?

Generally, the rich timeline mode will provide you with a more accurate timeline. Since your timeline gets rendered more than once at a time, you must ensure that your timeline is free of side effects and only relies on [`useCurrentFrame`](/docs/use-current-frame) for animation.

More renders also mean slower rendering. If you are suffering from slow playback and timeline scrubbing performance, consider disabling the rich timeline mode.

The rich timeline will become the default in the future, but right now it is disabled by default.

We encourage you to try out the rich timeline mode and [letting us know about any issues you will face](https://github.com/remotion-dev/remotion/issues/new).

## See also

- [Customize the number of timeline tracks shown](/docs/config#setmaxtimelinetracks) using the `setMaxTimelineTracks()` configuration.
