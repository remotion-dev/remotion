// Regression fixture for https://github.com/remotion-dev/remotion/issues/7447
// The error overlay does not dismiss after a runtime error is fixed.
// The e2e test toggles the radius argument below to reproduce.
import {blur} from '@remotion/effects/blur';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

const STYLE: React.CSSProperties = {width: '100%', height: '100%'};

export const ErrorOverlayRepro: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Solid
				width={400}
				height={400}
				color="#ff5fa2"
				style={STYLE}
				effects={[blur({radius: 24})]}
			/>
		</AbsoluteFill>
	);
};

export const UnsymbolicatedErrorOverlayRepro: React.FC = () => {
	const error = new TypeError('Expected defaults');
	error.stack = [
		'TypeError: Expected defaults',
		'    at unsymbolicatedErrorOverlayRepro (webpack-internal:///cannot-symbolicate.js:1:1)',
		'    at aDeliberatelyLongFunctionNameToTestHorizontalOverflow (webpack-internal:///this-is-a-deliberately-long-file-name-that-must-not-widen-the-error-overlay-beyond-the-viewport.js:2:3)',
	].join('\n');
	throw error;
};
