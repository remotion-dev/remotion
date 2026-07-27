import React from 'react';
import {AnimatedCaptions} from './AnimatedCaptions';

export const AnimatedCaptionsComposition: React.FC = () => {
	return (
		<AnimatedCaptions
			style={{height: 260, translate: '90px 50px', width: 900}}
			captions={[
				{
					confidence: null,
					startMs: 0,
					endMs: 380,
					text: 'I',
					timestampMs: 190,
				},
				{
					confidence: null,
					startMs: 380,
					endMs: 760,
					text: ' vibe',
					timestampMs: 570,
				},
				{
					confidence: null,
					startMs: 760,
					endMs: 1140,
					text: ' coded',
					timestampMs: 950,
				},
				{
					confidence: null,
					startMs: 1140,
					endMs: 1520,
					text: ' this',
					timestampMs: 1330,
				},
			]}
		/>
	);
};
