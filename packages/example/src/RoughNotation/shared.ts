import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import React from 'react';

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
