import {Interactive, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurSelectCaptureComposition} from './MotionBlurSelectCaptureComposition';

const MotionBlurSelectContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#f7f8fb',
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
					perspective: 1600,
					perspectiveOrigin: '50% 50%',
				}}
			>
				<MotionBlurSelectCaptureComposition
					name="Select the triangle in slow motion"
					trimBefore={111}
					durationInFrames={25}
					playbackRate={25 / 87}
					width={1572}
					height={1440}
					style={{
						left: '50%',
						top: '50%',
						translate: '-766px -727px',
						scale: 1.1,
						rotate: EXPLORE_CAMERA_ANGLE,
						transformOrigin: '766px 727px',
					}}
				/>
			</div>
		</div>
	);
};

export const MotionBlurSelect = Interactive.create({
	Component: MotionBlurSelectContent,
	layout: 'absolute-fill',
	schema: {},
});
