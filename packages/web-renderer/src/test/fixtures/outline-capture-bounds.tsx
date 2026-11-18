import {AbsoluteFill} from 'remotion';

const OutlineCaptureBounds = () => (
	<AbsoluteFill style={{backgroundColor: 'white'}}>
		<div
			style={{
				position: 'absolute',
				left: 20,
				top: 20,
				width: 80,
				height: 50,
				backgroundColor: '#2299ee',
				outline: '4px solid black',
				outlineOffset: -12,
				isolation: 'isolate',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 32,
					top: 20,
					width: 16,
					height: 10,
					backgroundColor: 'white',
					mixBlendMode: 'multiply',
				}}
			/>
		</div>
	</AbsoluteFill>
);

export const outlineCaptureBounds = {
	component: OutlineCaptureBounds,
	id: 'outline-capture-bounds',
	width: 120,
	height: 96,
	fps: 30,
	durationInFrames: 1,
};
