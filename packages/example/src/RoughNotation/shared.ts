import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import React from 'react';

export const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const containerStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
};
