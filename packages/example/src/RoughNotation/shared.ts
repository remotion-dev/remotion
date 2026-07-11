import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import React from 'react';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const containerStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
};

export const annotationTextStyle: React.CSSProperties = {
	fontSize: 80,
	fontWeight: 700,
	lineHeight: 1.1,
	color: '#171717',
	fontFamily,
	width: 800,
};
