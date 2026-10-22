import {
	turbulentDisplace,
	type TurbulentDisplaceParams,
} from '@remotion/effects/turbulent-displace';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {useHtmlInCanvasDocsDemoBranch} from '../demos/useHtmlInCanvasDocsDemoBranch';

export const TurbulentDisplaceTextSource: React.FC = () => {
	return (
		<Interactive.Div
			name="Fluid text"
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'Arial, Helvetica, sans-serif',
				fontSize: 170,
				fontWeight: 900,
				lineHeight: 1,
				color: 'white',
			}}
		>
			FLUID
		</Interactive.Div>
	);
};

export const EffectsTurbulentDisplacePreview: React.FC<
	Required<TurbulentDisplaceParams>
> = ({
	displacement,
	amount,
	size,
	offset,
	complexity,
	evolution,
	cycleEvolution,
	cycle,
	seed,
	pinning,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<CanvasImage
				name="Distorted text"
				src={staticFile('img/effects-turbulent-displace-text.png')}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					turbulentDisplace({
						displacement,
						amount,
						size,
						offset,
						complexity,
						evolution,
						cycleEvolution,
						cycle,
						seed,
						pinning,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

const TurbulentDisplaceScene: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<HtmlInCanvas
				name="Melting text"
				width={1280}
				height={720}
				effects={[
					turbulentDisplace({
						amount: interpolate(frame, [0, 30, 90, 120], [0, 120, 120, 0], {
							easing: Easing.bezier(0.42, 0, 0.58, 1),
						}),
						size: 150,
						complexity: 2,
						cycleEvolution: true,
						evolution: interpolate(frame, [0, 120], [0, 360]),
						pinning: 'all',
					}),
				]}
			>
				<TurbulentDisplaceTextSource />
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const TurbulentDisplaceDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgl2');

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: 'black'}} />;
	}

	if (branch === 'live') {
		return <TurbulentDisplaceScene />;
	}

	return (
		<Video
			name="Turbulent displace preview"
			muted
			src="https://remotion.media/turbulent-displace-demo-7a27507a8eb2.mp4"
			style={{width: '100%', height: '100%'}}
		/>
	);
};
