import {Interactive, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurBounceCaptureComposition} from './MotionBlurBounceCaptureComposition';

const MotionBlurBounceContent = () => {
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
			<MotionBlurBounceCaptureComposition
				name="Tilted edge-bounce recording"
				trimBefore={219}
				width={2190}
				height={1440}
				cropLeft={0.14}
				cropBottom={0.085}
				style={{
					left: '50%',
					top: '50%',
					translate: '-1037px -560px',
					scale: Math.min(width / 1440, height / 1080) * 0.94,
					rotate: EXPLORE_CAMERA_ANGLE,
					transformOrigin: '1037px 560px',
				}}
			/>
		</div>
	);
};

export const MotionBlurBounce = Interactive.create({
	Component: MotionBlurBounceContent,
	layout: 'absolute-fill',
	schema: {},
});
