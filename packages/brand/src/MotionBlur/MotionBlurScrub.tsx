import {Freeze, Interactive, Sequence, useVideoConfig} from 'remotion';
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
				<Freeze frame={366} active={(frame) => frame >= 366}>
					<MotionBlurScrubCaptureComposition
						name="Tilted Studio close-up"
						showCursor
						cursorHoldFrame={359}
						width={1904}
						height={1440}
						style={{
							left: '50%',
							top: height > width ? '63%' : '70%',
							translate: '-1156px -1035px',
							scale: Math.max(width / 1080, height / 960) * 1.28,
							rotate: '0.904608 0.351506 -0.241096 28deg',
							transformOrigin: '952px 994px',
						}}
					/>
				</Freeze>
			</div>
		</Sequence>
	);
};

export const MotionBlurScrub = Interactive.create({
	Component: MotionBlurScrubContent,
	layout: 'absolute-fill',
	schema: {},
});
