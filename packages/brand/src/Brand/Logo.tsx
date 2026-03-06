import {useCurrentFrame} from 'remotion';
import {useVideoConfig} from 'remotion';
import {Easing} from 'remotion';
import {interpolate} from 'remotion';
import {spring} from 'remotion';
import {Sequence} from 'remotion';
import React from 'react';
import {TriangleToSquare} from './TriangleToSquare';
import {getOpacity, Theme} from './colors';

export const Logo: React.FC<{
	theme: Theme;
}> = ({theme}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const toCircleProgress = spring({
		fps,
		frame,
		config: {damping: 20},
		durationInFrames: 40,
		delay: 25,
	});

	const breathe = (delay: number) => {
		return spring({
			fps,
			frame,
			reverse: true,
			delay,
		});
	};

	const anim = (delay: number) => {
		return (
			breathe(delay) -
			1 +
			spring({
				fps,
				frame,
				config: {
					damping: 200,
				},
				delay: 36 + delay,
			}) +
			Math.sin(Math.max(frame - 36 - delay, 0) / 10) * 0.1
		);
	};

	const progress = spring({
		fps,
		frame,
		config: {
			mass: 0.7,
			damping: 200,
		},
		durationInFrames: 50,
		delay: 24,
	});

	const progressWithEaseOut = interpolate(progress, [0, 1], [0, 1], {
		easing: Easing.inOut(Easing.ease),
	});

	const rotation = interpolate(
		progressWithEaseOut,
		[0, 1],
		[0, -Math.PI * 2.5],
		{
			easing: Easing.out(Easing.ease),
		}
	);

	const translation = interpolate(progressWithEaseOut, [0, 1], [0, 540], {
		easing: Easing.out(Easing.ease),
	});

	const posX = Math.sin(rotation) * translation;
	const posY = Math.cos(rotation) * translation * 0.7;

	return (
		<Sequence
			style={{
				transformOrigin: 'center center',
				transform: `scale(0.68) translateX(${posX}px) translateY(${posY}px)`,
			}}
		>
			<Sequence style={{}}>
				<Sequence
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						scale: String(1.2 + anim(2)),
					}}
				>
					<TriangleToSquare
						opacity={getOpacity(theme)}
						progress={toCircleProgress}
						style={{
							marginLeft: 90,
						}}
						length={360}
						theme={theme}
					/>
				</Sequence>
				<Sequence
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						scale: String(1.2 + anim(1)),
					}}
				>
					<TriangleToSquare
						opacity={0.3}
						progress={toCircleProgress}
						style={{
							marginLeft: 70,
						}}
						length={270}
						theme={theme}
					/>
				</Sequence>
				<Sequence
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						scale: String(1.2 + Math.max(anim(0), 0)),
					}}
				>
					<TriangleToSquare
						opacity={1}
						progress={toCircleProgress}
						style={{
							marginLeft: 50,
						}}
						length={180}
						theme={theme}
					/>
				</Sequence>
			</Sequence>
		</Sequence>
	);
};
