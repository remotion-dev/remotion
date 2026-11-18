import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {useVideoConfig} from 'remotion';
import {MotionBlurControlsCaptureComposition} from './MotionBlurControlsCaptureComposition';

export const MotionBlurCompilation = () => {
	const {fps} = useVideoConfig();

	return (
		<TransitionSeries name="Slow-motion close-ups">
			<TransitionSeries.Sequence
				name="Rotating triangle"
				durationInFrames={8 * fps}
				style={{
					perspective: 1800,
					backgroundColor: '#191e23',
				}}
			>
				<Video
					name="Rotating triangle close-up"
					src="https://remotion.media/motion-blur-2026-11-17/triangle-motion-blur-capture-75e2182b50ce.mp4"
					trimBefore={11.4 * fps}
					muted
					style={{
						position: 'absolute',
						width: 1920,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-883.6px -953.1px',
						transformOrigin: '995px 674px',
						rotate: '0.961493 0.256303 -0.0992 19.205075deg',
						scale: 1.158,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Bouncing drumsticks"
				trimBefore={fps}
				durationInFrames={5 * fps}
				style={{
					perspective: 1800,
					backgroundColor: '#191e23',
				}}
			>
				<Video
					name="Bouncing drumsticks close-up"
					src="https://remotion.media/motion-blur-2026-11-17/drumsticks-motion-blur-capture-2-a46bb51a0a4e.mp4"
					trimBefore={7.6 * fps}
					playbackRate={0.55}
					muted
					style={{
						position: 'absolute',
						width: 1870,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-1059.1px -843.5px',
						transformOrigin: '868px 674px',
						rotate: '0.978875 0.167552 -0.117176 24.679771deg',
						scale: 1.382,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="A-to-B transition"
				durationInFrames={8 * fps}
				style={{
					perspective: 1800,
					backgroundColor: '#191e23',
				}}
			>
				<Video
					name="A-to-B transition close-up"
					src="https://remotion.media/motion-blur-2026-11-17/transition-motion-blur-slow-capture-8dcc3e6d9fee.mp4"
					trimBefore={5.1 * fps}
					playbackRate={0.9}
					muted
					style={{
						position: 'absolute',
						width: 2012,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-896.7px -838.6px',
						transformOrigin: '990px 690px',
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
						scale: 1.098,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Shutter angle and samples adjustment"
				durationInFrames={7.6 * fps}
				style={{
					perspective: 2800,
					backgroundColor: '#191e23',
				}}
			>
				<MotionBlurControlsCaptureComposition
					name="Triangle and motion blur controls"
					trimBefore={224}
					width={2394}
					height={1538}
					cropTop={0.247}
					style={{
						left: '50%',
						top: '50%',
						translate: '-1350px -870px',
						transformOrigin: '1350px 870px',
						rotate: '0.971016 0.230493 0.063255 19.148163deg',
						scale: 1.05,
					}}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
