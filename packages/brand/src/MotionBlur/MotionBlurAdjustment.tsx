import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {MotionBlurEditorCaptureComposition} from './MotionBlurEditorCapture';

const MotionBlurAdjustmentContent = () => {
	const {width, height} = useVideoConfig();
	const playbackRate = 1.25;

	return (
		<Sequence
			name="Increase shutter angle"
			trimBefore={237}
			playbackRate={playbackRate}
			durationInFrames={105 * playbackRate}
			width={width}
			height={height}
		>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '50%',
					overflow: 'hidden',
					backgroundColor: '#1f2327',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 1080,
						height: 480,
						translate: '-50% -50%',
						scale: Math.min(width / 1080, height / 960),
						transformOrigin: '50% 50%',
						overflow: 'hidden',
						perspective: 1400,
						perspectiveOrigin: '50% 50%',
					}}
				>
					<MotionBlurEditorCaptureComposition
						name="Motion blur controls"
						width={3742}
						height={1966}
						cropLeft={0.72}
						cropRight={0.02}
						cropTop={0.185}
						cropBottom={0.712}
						style={{
							translate: '-2518px -232px',
							scale: 1.6,
							rotate: EXPLORE_CAMERA_ANGLE,
							transformOrigin: '84% 24%',
						}}
					/>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: '50%',
					width: '100%',
					height: '50%',
					overflow: 'hidden',
					backgroundColor: '#0e1317',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 1080,
						height: 480,
						translate: '-50% -50%',
						scale: Math.min(width / 1080, height / 960),
						transformOrigin: '50% 50%',
						overflow: 'hidden',
						perspective: 1400,
						perspectiveOrigin: '50% 50%',
					}}
				>
					<MotionBlurEditorCaptureComposition
						name="Canvas responding to motion blur"
						width={3742}
						height={1966}
						cropLeft={0.08}
						cropRight={0.4}
						cropTop={0.24}
						cropBottom={0.21}
						style={{
							translate: '-734px -774px',
							scale: 0.47,
							rotate: EXPLORE_CAMERA_ANGLE,
							transformOrigin: '34% 51.5%',
						}}
					/>
				</div>
			</div>
		</Sequence>
	);
};

export const MotionBlurAdjustment = Interactive.create({
	Component: MotionBlurAdjustmentContent,
	layout: 'absolute-fill',
	schema: {},
});
