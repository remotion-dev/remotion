import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from '../disco-light-show/assets';
import {NeonRays} from './NeonRays';
import {PaperDiscoBall} from './PaperDiscoBall';

export const PAPER_DISCO_SHOW_DURATION_IN_FRAMES = 300;

// Everything paper moves "on threes" (10 poses per second)
const P = 3;
const BALL_X = 540;
const BALL_Y = 860;
const BALL_SIZE = 900;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const PaperDiscoShow: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#1c1c20', overflow: 'hidden'}}>
			{/* 1. Paper background */}
			<CanvasImage
				name="Paper background"
				src={asset('paper-texture-dark-2566e6c4f4cc.jpg')}
				width={1080}
				height={1920}
				fit="cover"
				style={{position: 'absolute'}}
			/>

			{/* 2. Neon rays — underneath all the paper */}
			<NeonRays
				gridOpacity={0.4}
				name="Neon rays"
				centerX={BALL_X}
				centerY={BALL_Y}
				length={1500}
				rays={8}
				theme="dark"
				posterize={P}
				degreesPerSecond={10}
				progress={interpolate(frame, [6, 48], [0, 1], {
					...clamp,
					posterize: P,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				})}
				style={{
					position: 'absolute',
				}}
			/>

			{/* 3. Disco ball scaling in from its center */}
			<Interactive.Div
				name="Ball group"
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: `${BALL_X}px ${BALL_Y}px`,
					scale: interpolate(frame, [0, 33], [0, 1], {
						...clamp,
						posterize: P,
						easing: Easing.spring({damping: 12}),
					}),
				}}
			>
				<PaperDiscoBall
					gridOpacity={0.4}
					name="Paper disco ball"
					size={BALL_SIZE}
					posterize={P}
					revolutionsPerSecond={0.08}
					shadow
					shadowOpacity={0.6}
					style={{
						position: 'absolute',
						left: BALL_X - BALL_SIZE / 2,
						top: BALL_Y - BALL_SIZE / 2,
					}}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
