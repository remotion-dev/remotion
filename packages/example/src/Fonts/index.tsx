import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';

const waitForFont = delayRender();
const font = new FontFace(
	`Bangers`,
	`url(${staticFile('bangers.woff2')}) format('woff2')`
);

font
	.load()
	.then(() => {
		document.fonts.add(font);
		continueRender(waitForFont);
	})
	.catch((err) => console.log('Error loading font', err));

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: 'Bangers',
				fontSize: 300,
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
