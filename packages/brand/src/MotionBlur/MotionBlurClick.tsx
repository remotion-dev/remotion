import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {MotionBlurClickCaptureComposition} from './MotionBlurClickCapture';

const MotionBlurClickContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<Sequence
			name="Click Motion blur"
			trimBefore={161}
			durationInFrames={55}
			width={width}
			height={height}
			style={{
				backgroundColor: '#1f2327',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 1080,
					height: 960,
					translate: '-50% -50%',
					scale: Math.min(width / 1080, height / 960),
					transformOrigin: '50% 50%',
					perspective: 1400,
					perspectiveOrigin: '50% 50%',
				}}
			>
				<MotionBlurClickCaptureComposition
					name="Motion blur button click"
					width={1262}
					height={1184}
					cropLeft={0.199}
					cropRight={0.015}
					cropBottom={0.334}
					style={{
						translate: '40px -9px',
						scale: 1.47,
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
						transformOrigin: '52% 42%',
					}}
				/>
			</div>
		</Sequence>
	);
};

export const MotionBlurClick = Interactive.create({
	Component: MotionBlurClickContent,
	layout: 'absolute-fill',
	schema: {},
});
