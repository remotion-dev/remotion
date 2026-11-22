---
name: review
description: Render key frames, look at them and fix problems before handing off a video
metadata:
  tags: review, quality, stills, checklist, verification
---

# Review before handing off

Code that compiles is not a finished video. Look at the frames, as a motion designer would scrub the timeline.

## Render the key moments

Pick frames where something should be readable or complete:

- The end of each focal entrance.
- The middle of each hold.
- One frame in the middle of each transition.
- The first and last frame of the video.

Render them in one call and list the folder, as [Rendering](../remotion-render/SKILL.md) describes:

```
npx remotion render [composition-id] out/review --frames=45,120,200 --image-format=png
```

Open each image and look at it. If Studio is open and you can see it, you MAY scrub there instead.

## Checklist

Fix every item that fails, then render the same frames again:

- **Focus:** in each still, one element clearly reads first.
- **Legibility:** text is fully on screen, not clipped, not overlapping other text, and readable at its size on a phone.
- **Safe area:** important content respects [Video Layout Rules](../remotion-create/video-layout.md).
- **Contrast:** text stands out from what is behind it, including over footage.
- **Style:** only the fonts, colors and durations from `style.ts` are used.
- **Holds:** at the middle of each hold nothing is still moving, and text has its reading time from [timing and easing](timing-and-easing.md).
- **Transitions:** the middle-of-transition frame does not show broken layouts or two texts fighting.
- **Right-to-left:** words read in the correct order and Arabic letters are joined.

## Report honestly

When handing off, say what you checked and anything you could not check, such as audio sync you could not hear. Do not claim a frame looks right if you did not render it.
