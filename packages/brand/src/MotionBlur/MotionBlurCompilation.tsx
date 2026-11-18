import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const triangleSeconds = 8;
const drumsticksSeconds = 6;
const transitionSeconds = 8;

export const MOTION_BLUR_COMPILATION_SECONDS =
	triangleSeconds + drumsticksSeconds + transitionSeconds;

const DrumsticksCloseup = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Video
			name="Bouncing drumsticks close-up"
			src="https://remotion.media/motion-blur-2026-11-17/drumsticks-motion-blur-capture-2-a46bb51a0a4e.mp4"
			trimBefore={7.6 * fps}
			playbackRate={0.55}
			muted
			cropRight={134 / 1870}
			cropBottom={578 / 1440}
			style={{
				position: 'absolute',
				width: 1870,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: interpolate(
					frame,
					[0, 0.62 * drumsticksSeconds * fps, drumsticksSeconds * fps],
					['-765px -445px', '-1029px -528px', '-1190px -490px'],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
				transformOrigin: '990px 445px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 1.38,
			}}
		/>
	);
};

export const MotionBlurCompilation = () => {
	const {fps} = useVideoConfig();

	return (
		<TransitionSeries name="Slow-motion close-ups">
			<TransitionSeries.Sequence
				name="Rotating triangle"
				durationInFrames={triangleSeconds * fps}
				style={{
					perspective: 1800,
					overflow: 'hidden',
					backgroundColor: '#f7fafb',
				}}
			>
				<Video
					name="Rotating triangle close-up"
					src="https://remotion.media/motion-blur-2026-11-17/triangle-motion-blur-capture-75e2182b50ce.mp4"
					trimBefore={11.4 * fps}
					muted
					cropLeft={70 / 1920}
					cropBottom={400 / 1440}
					style={{
						position: 'absolute',
						width: 1920,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-990px -579px',
						transformOrigin: '990px 525px',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: 1.25,
					}}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Bouncing drumsticks"
				durationInFrames={drumsticksSeconds * fps}
				style={{
					perspective: 1800,
					overflow: 'hidden',
					backgroundColor: '#0f1317',
				}}
			>
				<DrumsticksCloseup />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="A-to-B transition"
				durationInFrames={transitionSeconds * fps}
				style={{
					perspective: 1800,
					overflow: 'hidden',
					backgroundColor: '#101318',
				}}
			>
				<Video
					name="A-to-B transition close-up"
					src="https://remotion.media/motion-blur-2026-11-17/transition-motion-blur-slow-capture-8dcc3e6d9fee.mp4"
					trimBefore={5.1 * fps}
					playbackRate={0.9}
					muted
					cropTop={65 / 1440}
					cropBottom={425 / 1440}
					style={{
						position: 'absolute',
						width: 2012,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-1006px -564px',
						transformOrigin: '1006px 564px',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: 1.5,
					}}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
