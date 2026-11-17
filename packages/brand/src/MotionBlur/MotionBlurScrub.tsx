import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {MotionBlurScrubCaptureComposition} from './MotionBlurScrubCaptureComposition';

const MotionBlurScrubContent = () => {
	const {width, height, fps} = useVideoConfig();

	return (
		<Sequence
			name="Slow scrub and hold on motion blur"
			trimBefore={9.8 * fps}
			durationInFrames={87}
			width={width}
			height={height}
			style={{backgroundColor: '#F8FAFC', overflow: 'hidden'}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					perspective: 1600,
					perspectiveOrigin: '50% 60%',
				}}
			>
				<MotionBlurScrubCaptureComposition
					name="Tilted Studio close-up"
					width={1904}
					height={1440}
					style={{
						left: '50%',
						top: '70%',
						translate: '-952px -994px',
						scale: Math.max(width / 1080, height / 960) * 1.45,
						rotate: '0.904608 0.351506 -0.241096 28deg',
						transformOrigin: '952px 994px',
					}}
				/>
			</div>
		</Sequence>
	);
};

export const MotionBlurScrub = Interactive.create({
	Component: MotionBlurScrubContent,
	layout: 'absolute-fill',
	schema: {},
});
