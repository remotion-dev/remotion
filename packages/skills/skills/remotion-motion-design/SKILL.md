---
name: remotion-motion-design
description: Motion design judgment - timing, easing, choreography, a consistent style and a self-review before handing off
version: 4.0.545
---

This skill is about how the motion should look and feel, not about how to write it.
For APIs and Studio-editable markup, follow [Remotion Markup](../remotion-markup/SKILL.md). For layout and text sizes, follow [Video Layout Rules](../remotion-create/video-layout.md). This skill builds on both and does not repeat them.

`MUST` marks requirements, `SHOULD` recommendations and `MAY` optional actions.

## Decide before animating

Before writing markup for a new video or scene, settle these and keep them for the whole video:

1. **The one thing per scene.** What should the viewer notice first? Everything else supports it.
2. **The style.** Pick one from [styles](styles.md) that fits the user's request, or derive one from their brand. It fixes the fonts, colors, easing and durations. You MUST NOT mix styles inside one video unless asked.
3. **The rhythm.** How long each scene holds, and whether motion follows music, a voiceover or the reading pace.

If the user gave a style, brand or reference, it wins over these defaults.

## Timing and easing

Read [timing and easing](timing-and-easing.md) before choosing durations or curves. In short:

- Entrances ease out, exits ease in and are shorter than entrances.
- Durations come from a small set of steps, not ad hoc numbers.
- Text holds long enough to be read, measured in words.
- Bounce and overshoot are a style choice, not a default.

## Choreography

Read [choreography](choreography.md) when more than one element moves. In short:

- One focal movement at a time. Supporting elements follow it.
- Related items enter in a short stagger, in reading order.
- Motion keeps one direction per scene, and follows the reading direction of the language.
- Something should always be alive, but never everything at once.

## Restraint

These make a video look generated. Avoid them unless the user asks:

- Every element fading in over the same 1 second.
- Everything entering at frame 0.
- Spinning or bouncing text.
- More than two typefaces, or more than one accent color, in a scene.
- Decorative motion that competes with the focal element.
- Long linear moves with no easing.

## Review before handing off

You MUST review your own frames before telling the user the video is done. Follow [review](review.md): render stills at the key moments, look at them, check them against the checklist and fix what fails. Do not describe a video you have not looked at.
