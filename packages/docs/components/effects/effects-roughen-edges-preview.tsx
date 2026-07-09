import {roughenEdges} from '@remotion/effects/roughen-edges';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

export const ROUGHEN_EDGES_TEXT_IMAGE_SRC =
	'img/effects-roughen-edges-text.png';

export const ROUGHEN_EDGES_PREVIEW_PARAMS = {
	amount: 1,
	border: 26.5,
	scale: 0.07,
	seed: 231.2,
} as const;

const container: React.CSSProperties = {
	backgroundColor: '#172033',
};

const textContainer: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
};

const textStyle: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Inter, Arial, Helvetica, system-ui, -apple-system, sans-serif',
	fontSize: 270,
	fontWeight: 900,
	letterSpacing: 0,
	lineHeight: 0.9,
	textAlign: 'center',
};

export const RoughenEdgesTextSource: React.FC = () => {
	return (
		<AbsoluteFill style={textContainer}>
			<div style={textStyle}>EDGE</div>
		</AbsoluteFill>
	);
};

export const EffectsRoughenEdgesPreview: React.FC<{
	readonly amount: number;
	readonly border: number;
	readonly scale: number;
	readonly seed: number;
}> = ({amount, border, scale, seed}) => {
	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={staticFile(ROUGHEN_EDGES_TEXT_IMAGE_SRC)}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					roughenEdges({
						amount,
						border,
						scale,
						seed,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
