import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const containerStyle: React.CSSProperties = {
	color: '#171717',
	fontFamily,
	justifyContent: 'center',
	alignItems: 'center',
	fontSize: 96,
	fontWeight: 700,
	textAlign: 'center',
};

export const useAnnotationProgress = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 60,
	});
};
