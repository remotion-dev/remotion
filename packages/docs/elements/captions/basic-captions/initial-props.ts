import type {ComponentProps} from 'react';
import type {BasicCaptions} from './basic-captions';

export const basicCaptionsInitialProps = {
	captions: [
		{
			text: 'Simple captions,ready for every video.',
			startMs: 0,
			endMs: 2200,
			timestampMs: 1100,
			confidence: null,
			pageBreakAfter: true,
		},
		{
			text: 'No animation,\njust clear text.',
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
	combineTokensWithinMilliseconds: 2000,
	width: 900,
	height: 220,
} satisfies ComponentProps<typeof BasicCaptions>;
