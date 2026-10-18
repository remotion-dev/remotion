import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {NeonRays} from './NeonRays';
import {PaperDiscoBall} from './PaperDiscoBall';

// A ~1.2s version of PaperDiscoShow for the "How did I do this?" beat:
// the ball pops in and the tissue rays shoot out, hold, then the rays spin
// and retract while the ball scales back to 0. Transparent background so it
// sits on the Master's paper background.
const PaperDiscoStingInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Interactive.Div
				name="Rays"
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: '540px 960px',
					rotate: interpolate(frame, [22, 37], ['0deg', '150deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.in(Easing.cubic),
					}),
				}}
			>
				<NeonRays
					name="Tissue paper rays"
					gridOpacity={0.4}
					centerX={540}
					centerY={960}
					rays={8}
					length={1500}
					posterize={2}
					degreesPerSecond={20}
					progress={interpolate(frame, [2, 13, 22, 34], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 2,
						easing: [
							Easing.out(Easing.cubic),
							Easing.linear,
							Easing.in(Easing.cubic),
						],
					})}
					style={{position: 'absolute'}}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Disco ball"
				style={{
					position: 'absolute',
					left: 90,
					top: 510,
					width: 900,
					height: 900,
					scale: interpolate(frame, [0, 8, 26, 36], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 2,
						easing: [
							Easing.out(Easing.back(1.6)),
							Easing.linear,
							Easing.in(Easing.back(1.4)),
						],
						output: 'perceptual-scale',
					}),
				}}
			>
				<PaperDiscoBall
					name="Paper disco ball"
					gridOpacity={0.4}
					size={900}
					posterize={2}
					shadow
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const PAPER_DISCO_STING_DURATION_IN_FRAMES = 37;

export const PaperDiscoSting = Interactive.create({
	Component: PaperDiscoStingInner,
	layout: 'absolute-fill',
});
