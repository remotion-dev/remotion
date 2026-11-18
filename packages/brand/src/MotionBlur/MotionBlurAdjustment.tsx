import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurControlsCaptureComposition} from './MotionBlurControlsCaptureComposition';

const MotionBlurAdjustmentContent = () => {
	const {width, height} = useVideoConfig();
	const sourceDurationInFrames = 228;
	const scale = Math.min(width / 1080, height / 960);

	return (
		<Sequence
			name="Adjust shutter angle and samples"
			trimBefore={224}
			playbackRate={sourceDurationInFrames / 105}
			durationInFrames={sourceDurationInFrames}
			width={width}
			height={height}
		>
			<div
				style={{
					position: 'absolute',
					inset: '0 0 60% 0',
					overflow: 'hidden',
					backgroundColor: '#1f2427',
					perspective: 1400,
				}}
			>
				<MotionBlurControlsCaptureComposition
					name="Shutter angle and samples controls"
					width={2394}
					height={1538}
					cropLeft={0.62}
					cropRight={0.036}
					cropTop={0.247}
					cropBottom={0.568}
					style={{
						left: '50%',
						top: '50%',
						translate: '-1890px -510px',
						transformOrigin: '1890px 510px',
						scale: scale * 1.16,
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					inset: '40% 0 0 0',
					overflow: 'hidden',
					backgroundColor: '#f6fafb',
					perspective: 1400,
				}}
			>
				<MotionBlurControlsCaptureComposition
					name="Triangle responding to motion blur"
					width={2394}
					height={1538}
					cropLeft={0.12}
					cropRight={0.39}
					cropTop={0.247}
					cropBottom={0.11}
					style={{
						left: '50%',
						top: '45%',
						translate: '-923px -840px',
						transformOrigin: '923px 840px',
						scale: scale * 0.55,
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				/>
			</div>
		</Sequence>
	);
};

export const MotionBlurAdjustment = Interactive.create({
	Component: MotionBlurAdjustmentContent,
	layout: 'absolute-fill',
	schema: {},
});
