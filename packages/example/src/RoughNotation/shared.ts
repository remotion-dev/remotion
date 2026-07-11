import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const containerStyle: React.CSSProperties = {
	backgroundColor: '#f7f2e8',
	color: '#171717',
	fontFamily: 'GT Planar, sans-serif',
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
