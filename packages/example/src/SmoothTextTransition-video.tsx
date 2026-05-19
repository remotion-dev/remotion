import {visualControl} from '@remotion/studio';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const SmoothTextTransitionVideo: React.FC = () => {
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
					{visualControl('text', 'hi there')}
				</div>
			</div>
		</AbsoluteFill>
	);
};
