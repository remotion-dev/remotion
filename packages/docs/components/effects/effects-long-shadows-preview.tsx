import {longShadows} from '@remotion/effects/long-shadows';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

export const LONG_SHADOWS_PREVIEW_PARAMS = {
	length: 1000,
	angle: 45,
	color: '#777777',
	opacity: 1,
} as const;

export const LongShadowsTextSource: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				paddingLeft: 140,
				paddingBottom: 120,
			}}
		>
			<div
				style={{
					color: 'white',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 170,
					fontWeight: 900,
					letterSpacing: -6,
					lineHeight: 0.95,
				}}
			>
				LONG
				<br />
				SHADOWS
			</div>
		</AbsoluteFill>
	);
};

export const EffectsLongShadowsPreview: React.FC<{
	readonly length: number;
	readonly angle: number;
	readonly color: string;
	readonly opacity: number;
}> = ({length, angle, color, opacity}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#b8b8b8'}}>
			<CanvasImage
				src={staticFile('img/effects-long-shadows-text.png')}
				width={1280}
				height={720}
				fit="cover"
				effects={[longShadows({length, angle, color, opacity})]}
			/>
		</AbsoluteFill>
	);
};
