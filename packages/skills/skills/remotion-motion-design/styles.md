---
name: styles
description: Style presets that fix typography, color, easing and pace for a whole video
metadata:
  tags: style, preset, brand, typography, color, aesthetic, design system
---

# Styles

A style is a small set of decisions made once and kept for the whole video. Pick the preset closest to the request, adapt it to the user's brand, and write the values into one `style.ts` file that every scene imports. Do not hard-code colors, fonts or durations in scenes.

```ts title="style.ts"
import {Easing} from 'remotion';

export const style = {
	fonts: {display: 'Inter', body: 'Inter'},
	colors: {background: '#0B0B0F', text: '#F5F5F7', muted: '#8A8A93', accent: '#3B82F6'},
	ease: {enter: Easing.bezier(0.16, 1, 0.3, 1), exit: Easing.bezier(0.7, 0, 0.84, 0)},
	// Seconds, multiplied by fps in scenes.
	duration: {micro: 0.2, short: 0.4, medium: 0.6, long: 0.9},
	stagger: 0.08,
} as const;
```

Load fonts as [Google Fonts](../remotion-markup/google-fonts.md) or [local fonts](../remotion-markup/local-fonts.md) explains. Before building from scratch, check whether a [Remotion Element](https://www.remotion.dev/elements) already fits the style.

## Presets

| Preset        | Type                                               | Color                                                      | Motion                                                                    | Fits                               |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| Clean product | One sans family, two weights                       | Neutral background, one brand accent                       | Medium durations, enter curve, small translates, no overshoot             | Product launches, SaaS, explainers |
| Editorial     | Serif headlines, sans body, generous spacing       | Paper or deep tone, restrained accent                      | Long durations, slow drifts, crossfades, long holds                       | Stories, documentaries, quotes     |
| Kinetic type  | Heavy sans or condensed, very large                | High contrast, one or two colors                           | Short durations, cuts on beats, words as the main graphic                 | Music, social, announcements       |
| Playful       | Rounded sans                                       | Bright, several accents allowed                            | Springs with overshoot on small items, bigger moves, faster stagger       | Kids, consumer apps, celebrations  |
| Cinematic     | Thin or wide sans, wide letter spacing, small type | Dark, graded footage, warm or cool tint                    | Long durations, slow scale drifts, motion blur on fast moves, light leaks | Trailers, brand films, reveals     |
| Data          | Tabular figures, one sans family                   | Neutral, one color per series, highlight for the key value | Values count up, bars grow from a baseline, one series at a time          | Reports, dashboards, charts        |

- Within a preset, the focal element gets the accent color and the largest size. Nothing else competes with it.
- For right-to-left languages, pick a font with good Arabic or Hebrew shaping and mirror horizontal motion, see [choreography](choreography.md).
- If the user names a brand, use its colors and fonts and keep the preset's motion rules.
