import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

export const ForkDrop: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				name="Cursor chat window"
				src={asset('Screenshot 2026-07-19 at 16.26.01.png')}
				style={{
					position: 'absolute',
					translate: '154px 795px',
					width: 772,
					height: 330,
					scale: 1.202,
				}}
			/>
			<Interactive.Div
				name="Chat drop highlight"
				style={{
					position: 'absolute',
					left: 79,
					top: 900,
					width: 922,
					height: 238,
					borderRadius: 48,
					border: '5px solid rgba(88, 101, 242, 0.75)',
					boxShadow: '0 0 48px rgba(88, 101, 242, 0.42)',
					opacity: interpolate(frame, [24, 31, 42, 54], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
					}),
					scale: interpolate(frame, [24, 35], ['0.97', '0.96 1'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
						],
					}),
					transformOrigin: '50% 50%',
				}}
			/>
			<Interactive.Div
				name="Forked Hugging Face page"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1428,
					height: 786,
					overflow: 'hidden',
					borderRadius: 30,
					border: '8px solid rgba(255, 255, 255, 0.95)',
					boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)',
					translate: interpolate(
						frame,
						[0, 30, 38],
						['-444px -880px', '-444px 630px', '-444px 630px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.33, 0, 0.2, 1),
						},
					),
					scale: interpolate(frame, [0, 30, 38], [0.3, 0.215, 0.225], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.back(1.8)),
					}),
					rotate: interpolate(frame, [0, 30, 38], ['-5deg', '2deg', '0deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					}),
					transformOrigin: '50% 50%',
				}}
			>
				<Img
					src={asset('Screenshot 2026-07-19 at 14.35.33.png')}
					style={{width: 1428, height: 786}}
					showInTimeline={false}
				/>
			</Interactive.Div>
			<Img
				name="Dragging fork"
				src={asset('elegant-silver-fork-free-png.webp')}
				style={{
					position: 'absolute',
					width: 350,
					height: 350,
					translate: interpolate(
						frame,
						[0, 30, 52],
						['95px -1020px', '95px 650px', '95px -1020px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.bezier(0.33, 0, 0.2, 1),
								Easing.inOut(Easing.cubic),
							],
						},
					),
					scale: interpolate(frame, [0, 30, 52], [2.4, 1.8, 1.45], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					}),
					rotate: interpolate(
						frame,
						[0, 30, 52],
						['180deg', '180deg', '168deg'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					transformOrigin: '50% 50%',
					filter: 'drop-shadow(0 20px 18px rgba(0, 0, 0, 0.28))',
				}}
			/>
		</AbsoluteFill>
	);
};
