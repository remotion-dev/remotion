import {StudioInternals} from '@remotion/studio';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const Comp: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				fontSize: 20,
				display: 'flex',
				lineHeight: 1,
				fontFamily: 'sans-serif',
				backgroundColor: 'white',
				textAlign: 'center',
				flexDirection: 'row',
			}}
		>
			<div style={{width: 100}}>
				<div
					style={{
						transform:
							'translateY(' + interpolate(frame, [0, 200], [0, 50]) + 'px)',
					}}
				>
					hi there
				</div>
			</div>
			<div style={{width: 100}}>
				<div
					style={{
						transform:
							'translateY(' +
							interpolate(frame, [0, 200], [0, 50]) +
							'px) perspective(100px)',
						willChange: 'transform',
					}}
				>
					hi there
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const SmoothTextTransition = StudioInternals.createComposition({
	component: Comp,
	height: 100,
	width: 200,
	id: 'smooth-text',
	durationInFrames: 200,
	fps: 3,
});
