import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 20,
			}}
		>
			<div style={{width: 550}}>
				<p style={{fontVariantCaps: 'normal', marginBottom: 10}}>
					Normal caps: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontVariantCaps: 'small-caps', marginBottom: 10}}>
					Small caps: The quick brown fox jumps over the lazy dog.
				</p>
				<p style={{fontVariantCaps: 'all-small-caps', marginBottom: 10}}>
					All small caps: The quick brown fox jumps over the lazy dog.
				</p>
				<p
					style={{
						fontFeatureSettings: '"smcp"',
					}}
				>
					Font feature settings smcp: The quick brown fox jumps over the lazy
					dog.
				</p>
			</div>
		</AbsoluteFill>
	);
};

export const fontVariantCaps = {
	component: Component,
	id: 'font-variant-caps',
	width: 550,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
