import {bevelAlpha, type BevelAlphaParams} from '@remotion/effects/bevel-alpha';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	HtmlInCanvas,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {useHtmlInCanvasDocsDemoBranch} from '../demos/useHtmlInCanvasDocsDemoBranch';

export const BevelAlphaTextSource: React.FC = () => (
	<Interactive.Div
		name="Bevel text"
		style={{
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'Arial, Helvetica, sans-serif',
			fontSize: 180,
			fontWeight: 900,
			lineHeight: 1,
			color: 'white',
		}}
	>
		BEVEL
	</Interactive.Div>
);

export const EffectsBevelAlphaPreview: React.FC<Required<BevelAlphaParams>> = ({
	edgeThickness,
	lightAngle,
	lightColor,
	lightIntensity,
}) => (
	<AbsoluteFill style={{backgroundColor: 'black'}}>
		<CanvasImage
			name="Beveled text"
			src={staticFile('img/effects-bevel-alpha-text.png')}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				bevelAlpha({edgeThickness, lightAngle, lightColor, lightIntensity}),
			]}
		/>
	</AbsoluteFill>
);

const BevelAlphaScene: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<HtmlInCanvas
				name="Moving bevel light"
				width={1280}
				height={720}
				effects={[
					bevelAlpha({
						edgeThickness: 14,
						lightAngle: interpolate(frame, [0, 120], [-60, 300]),
						lightIntensity: 0.9,
						lightColor: 'white',
					}),
				]}
			>
				<BevelAlphaTextSource />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const BevelAlphaDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgl2');
	if (branch === 'pending')
		return <AbsoluteFill style={{backgroundColor: 'black'}} />;
	if (branch === 'live') return <BevelAlphaScene />;
	return (
		<Video
			name="Bevel alpha preview"
			muted
			src="https://remotion.media/bevel-alpha-demo-b61514bb5b60.mp4"
			style={{width: '100%', height: '100%'}}
		/>
	);
};
