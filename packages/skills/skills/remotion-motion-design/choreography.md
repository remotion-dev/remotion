---
name: choreography
description: Order, stagger, direction and focus when several elements move in a scene
metadata:
  tags: choreography, stagger, sequencing, hierarchy, focus, direction
---

# Choreography

## Order by importance

Bring elements in by what the viewer should read first:

1. The focal element: headline, product, number, face.
2. What explains it: subtitle, label, supporting image.
3. Details: logos, small print, decoration.

The focal element SHOULD finish most of its entrance before the next group starts. Do not start all groups at frame 0.

## Stagger

Related items that share a role, such as list items, words of a title, cards or chart bars, enter one after another:

- Offset each item by 0.05 to 0.1 seconds. Larger offsets read as separate events.
- Keep the total stagger under about 0.6 seconds. With many items, reduce the offset rather than making the group slow.
- Stagger in reading order: top to bottom, and in the reading direction of the language.

Give each item its own `<Sequence>` so the offsets stay editable on the timeline:

```tsx
import {Sequence, useVideoConfig} from 'remotion';
import {ListItem} from './ListItem';

export const List: React.FC<{readonly items: string[]}> = ({items}) => {
	const {fps} = useVideoConfig();

	return (
		<>
			{items.map((item, i) => (
				<Sequence key={item} name={item} from={Math.round(i * 0.08 * fps)} layout="none">
					<ListItem text={item} />
				</Sequence>
			))}
		</>
	);
};
```

`ListItem` animates from its own frame 0, using an entrance from [timing and easing](timing-and-easing.md).

## Direction

- Pick one direction of travel per scene and keep it. Mixed directions read as chaos.
- Elements enter from the side they relate to. A label for something on the left enters from the left.
- For right-to-left languages, mirror horizontal motion and the stagger order. Set the base direction as [Arabic and right-to-left text](../remotion-markup/arabic-text.md) explains, and animate words, not letters.
- Exits SHOULD continue the direction of travel, or go back the way the element came. Pick one rule per video.

## One focus at a time

- Only one element should make a large move at any moment. Others hold or make small moves.
- When the focus changes, the old focal element settles (stops, dims or shrinks a little) as the new one arrives.
- Keep something subtly alive in long holds: a slow scale drift of 2 to 3% over the scene, a slow background move or a light leak. Never animate everything at once.

## Between scenes

- Keep the transition style consistent through the video. One or two kinds of transition is plenty. See [transitions](../remotion-markup/transitions.md).
- Carry something across the cut when you can: a shape, a color, a position. Continuity makes cuts feel designed.
- Faster cuts suit energy and music. Calm and explanatory videos need longer holds and softer transitions.
