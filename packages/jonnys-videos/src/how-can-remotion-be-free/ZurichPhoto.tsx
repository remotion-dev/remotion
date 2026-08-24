import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

export const ZURICH_PHOTO_DURATION_IN_FRAMES = 48;

export const ZurichPhoto: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Interactive.Div
				name="Zurich full-screen photograph"
				style={{
					inset: 0,
					opacity: interpolate(frame, [0, 5, 40, 47], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					overflow: 'hidden',
					position: 'absolute',
				}}
			>
				<CanvasImage
					name="Zurich Bahnhofstrasse photograph"
					src={asset('zurich-bahnhofstrasse.jpg')}
					style={{
						filter: 'saturate(1.04) contrast(1.02)',
						height: 1920,
						left: -300,
						position: 'absolute',
						scale: interpolate(frame, [0, 47], [1.035, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
						top: 0,
						width: 2560,
					}}
				/>
				<Interactive.Div
					name="Caption contrast gradient"
					style={{
						background:
							'linear-gradient(180deg, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, 0.08) 51%, rgba(0, 0, 0, 0.52) 82%, rgba(0, 0, 0, 0.68) 100%)',
						inset: 0,
						position: 'absolute',
					}}
				/>
				<CanvasImage
					name="Flying Zurich watch"
					src={asset('zurich-watch-cutout.png')}
					style={{
						filter: 'drop-shadow(0 28px 24px rgba(0, 0, 0, 0.46))',
						height: 480,
						left: 0,
						position: 'absolute',
						rotate: interpolate(
							frame,
							[0, 24, 47],
							['-18deg', '8deg', '30deg'],
							{
								easing: Easing.bezier(0.22, 0.72, 0.24, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						scale: interpolate(frame, [0, 24, 47], [0.68, 1.06, 0.72], {
							easing: Easing.bezier(0.22, 0.72, 0.24, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
						top: 0,
						translate: interpolate(
							frame,
							[0, 24, 47],
							['-850px 980px', '180px 560px', '1250px 120px'],
							{
								easing: Easing.bezier(0.22, 0.72, 0.24, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						width: 720,
					}}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
