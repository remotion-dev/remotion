---
title: Use the timeline
id: timeline
---

At the bottom of the Remotion preview player, you will see a timeline.
Remotions timeline has two modes: **Simple timeline** (_default_) and **Rich timeline** (experimental, will become default in the future).

<img src="/img/timeline.png"></img>

You may switch between the two modes by clicking the icon with the three lines:

<img src="/img/timeline-toggle.png"></img>

## Simple timeline

The **simple timeline** will visualize the content that is rendered by your composition at the current time. This is a simple and efficient way of visualizing your content, as it will only render what you anyway see in the top panel of the editor. However, it is limited: If you place your cursor outside the time range of a sequence, Remotion cannot gather information about that sequence because it simply is not rendered at this time. This means that while the playback head is moving, the timeline may change.

## Rich timeline

The **rich timeline** will render additional frames to gather enough information to visualize a full timeline.
Sequences which are normally not rendered because the playback head is not within the time range of the sequence, will appear because Remotion is doing an additional render at a time where the sequence is visible.

These additional renders will appear as thumbnails in the timeline. Therefore, these thumbnails are only available in rich timeline mode.

## Which mode should I use?

Generally, the rich timeline mode will provide you with a more accurate timeline. Since your timeline gets rendered more than once at a time, you must ensure that your timeline is free of side effects and only relies on [`useCurrentFrame`](/docs/use-current-frame) for animation.

More renders also mean slower rendering. If you are suffering from slow playback and timeline scrubbing performance, consider disabling the rich timeline mode.

The rich timline will become the default in the future, but right now it is disabled by default.

We encourage you to try out the rich timeline mode and [letting us know about any issues you will face.](https://github.com/remotion-dev/remotion/issues/new).
