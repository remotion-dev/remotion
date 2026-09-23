import type {ComponentProps} from 'react';
import type {RoundedCaptions} from './rounded-captions';

export const roundedCaptionsInitialProps = {
	captions: [
		{
			text: 'Rounded captions,\nready for every video.',
			startMs: 0,
			endMs: 2200,
			timestampMs: 1100,
			confidence: null,
			pageBreakAfter: true,
		},
		{
			text: 'Clear text,\nwith a rounded background.',
			startMs: 2200,
			endMs: 4400,
			timestampMs: 3300,
			confidence: null,
			pageBreakAfter: true,
		},
		{
			text: 'Easy to read,\nand easy to customize.',
			startMs: 4400,
			endMs: 7000,
			timestampMs: 5700,
			confidence: null,
		},
	],
	playbackRate: 1,
	combineTokensWithinMilliseconds: 2000,
	width: 900,
	height: 220,
} satisfies ComponentProps<typeof RoundedCaptions>;
