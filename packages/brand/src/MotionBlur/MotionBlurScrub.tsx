import {Video} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const MotionBlurScrubContent = () => {
	const {width, height, fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#1f2327',
				overflow: 'hidden',
				perspective: 1800,
			}}
		>
			<Video
				name="Rotating triangle close-up"
				src="https://remotion.media/motion-blur-2026-11-17/triangle-motion-blur-capture-75e2182b50ce.mp4"
				trimBefore={Math.round(13.03 * fps)}
				cropLeft={0.035}
				muted
				style={{
					position: 'absolute',
					width: 1920,
					height: 1440,
					left: '50%',
					top: '50%',
					translate: '-1050px -750px',
					transformOrigin: '1050px 750px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: Math.min(width / 1080, height / 960) * 0.78,
				}}
			/>
		</div>
	);
};

export const MotionBlurScrub = Interactive.create({
	Component: MotionBlurScrubContent,
	layout: 'absolute-fill',
	schema: {},
});
