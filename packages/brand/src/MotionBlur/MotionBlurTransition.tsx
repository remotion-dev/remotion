import {Interactive, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurTransitionCaptureComposition} from './MotionBlurTransitionCaptureComposition';

const MotionBlurTransitionContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#1f2327',
				perspective: 1600,
			}}
		>
			<MotionBlurTransitionCaptureComposition
				name="Tilted A-to-B transition"
				trimBefore={259}
				playbackRate={1.25}
				width={2348}
				height={1688}
				cropLeft={0.063}
				cropRight={0.105}
				cropTop={0.145}
				style={{
					left: '50%',
					top: '50%',
					translate: '-1125px -780px',
					scale: Math.max(width / 1080, height / 960) * 1.395,
					rotate: EXPLORE_CAMERA_ANGLE,
					transformOrigin: '1125px 780px',
				}}
			/>
		</div>
	);
};

export const MotionBlurTransition = Interactive.create({
	Component: MotionBlurTransitionContent,
	layout: 'absolute-fill',
	schema: {},
});
