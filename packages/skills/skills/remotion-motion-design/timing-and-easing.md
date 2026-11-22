---
name: timing-and-easing
description: Duration steps, easing curves, reading time and holds for motion graphics
metadata:
  tags: timing, easing, duration, spring, bezier, hold, reading time
---

# Timing and easing

All durations below are in seconds. Convert with `fps` from `useVideoConfig()` so they stay correct if the frame rate changes, as [Remotion Markup](../remotion-markup/SKILL.md) requires.

## Duration steps

Pick from a small set of steps so the video feels consistent:

| Step   | Seconds | Use for                                              |
| ------ | ------- | ---------------------------------------------------- |
| Micro  | 0.2     | Small state changes, highlights, a word color change |
| Short  | 0.4     | Supporting text, icons, list items                   |
| Medium | 0.6     | Headlines, cards, most entrances                     |
| Long   | 0.9     | Hero moments, full-frame reveals, camera moves       |

- Larger and heavier things move slower than small ones. A full-frame wipe at 0.2 seconds feels broken; a small icon at 0.9 seconds feels sluggish.
- Exits SHOULD be about two thirds of the matching entrance. The viewer has already seen the element.
- A style from [styles](styles.md) MAY scale all steps up or down together. Keep the ratios.

## Easing

Use these curves, which are all available on `Easing`:

| Feel                | Curve                             | Use for                             |
| ------------------- | --------------------------------- | ----------------------------------- |
| Enter, decelerate   | `Easing.bezier(0.16, 1, 0.3, 1)`  | Most entrances                      |
| Exit, accelerate    | `Easing.bezier(0.7, 0, 0.84, 0)`  | Elements leaving the frame          |
| Move between states | `Easing.bezier(0.65, 0, 0.35, 1)` | Repositioning, morphs, camera moves |
| Natural, no bounce  | `Easing.spring({damping: 200})`   | Calm, physical entrances            |
| Playful, overshoot  | `Easing.spring({damping: 12})`    | Only in playful styles, small items |

- Entrances MUST NOT use an ease-in curve. Starting slow and arriving fast reads as an exit.
- Opacity alone is the weakest entrance. Pair it with a small `translate` (20 to 40px at 1080px width) or a `scale` from about 0.96, so the element arrives from somewhere.
- For `scale`, keep `output: 'perceptual-scale'` as Remotion Markup requires.
- Linear easing is right only for constant motion that has no start or end on screen, such as a slow background drift, a ticker or a progress bar.

```tsx
import {Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Headline: React.FC<{readonly text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Interactive.Div
			name="Headline"
			style={{
				opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				}),
				translate: interpolate(frame, [0, 0.6 * fps], ['0px 32px', '0px 0px'], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				}),
			}}
		>
			{text}
		</Interactive.Div>
	);
};
```

## Reading time

Text on screen MUST stay still and fully visible long enough to be read before it moves again or leaves:

- Hold for at least 1 second, plus 0.3 seconds per word, counted from when the entrance finishes.
- A 6-word headline therefore needs about 2.8 seconds of stillness.
- If the scene is too short for its text, cut words or lengthen the scene. Do not speed up the reading.
- Text synced to a voiceover follows the voice instead, see [captions](../remotion-captions/SKILL.md).

## Holds and rhythm

- After the last entrance of a scene, hold before the next transition. Motion needs stillness around it to be seen.
- Vary scene lengths a little. Identical lengths for every scene feel mechanical.
- When there is music, start key entrances on beats. Use [audio visualization](../remotion-markup/audio-visualization.md) or known beat times to find them.
