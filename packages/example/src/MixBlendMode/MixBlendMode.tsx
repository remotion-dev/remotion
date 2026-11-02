import React from 'react';
import {
	AbsoluteFill,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const modes = [
	'multiply',
	'screen',
	'overlay',
	'color-dodge',
	'difference',
	'hue',
	'luminosity',
] as const;

// https://github.com/remotion-dev/remotion/issues/12593
export const MixBlendMode: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const left = interpolate(frame, [0, durationInFrames - 1], [200, 640]);

	return (
		<AbsoluteFill style={{backgroundColor: '#1a1d24'}}>
			<Img
				src={staticFile('1.jpg')}
				style={{
					position: 'absolute',
					left: 80,
					top: 60,
					width: 1120,
					height: 600,
					objectFit: 'cover',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left,
					top: 120,
					width: 400,
					height: 220,
					backgroundColor: '#d94f2b',
					mixBlendMode: 'multiply',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 360,
					textAlign: 'center',
					fontFamily: 'sans-serif',
					fontSize: 120,
					fontWeight: 900,
					color: 'white',
					mixBlendMode: 'difference',
				}}
			>
				BLEND
			</div>
			<div
				style={{
					position: 'absolute',
					left: 110,
					top: 520,
					display: 'flex',
					gap: 16,
				}}
			>
				{modes.map((mode) => (
					<div
						key={mode}
						style={{
							width: 140,
							height: 110,
							borderRadius: 12,
							background:
								'linear-gradient(135deg, #ff2d55, #ffcc00 50%, #34c759)',
							mixBlendMode: mode,
							display: 'flex',
							alignItems: 'flex-end',
							padding: 10,
							boxSizing: 'border-box',
							fontFamily: 'sans-serif',
							fontSize: 18,
							fontWeight: 700,
							color: 'white',
						}}
					>
						{mode}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};
