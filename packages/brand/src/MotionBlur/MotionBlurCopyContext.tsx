import {Interactive, Sequence} from 'remotion';
import {CopyContextCaptureComposition} from '../AgenticallyProgrammatically/CopyContextCaptureComposition';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const MotionBlurCopyContextContent = () => {
	return (
		<Sequence
			name="Copy context for agents click"
			trimBefore={55}
			durationInFrames={60}
			playbackRate={60 / 38}
			layout="none"
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					perspective: 1600,
					perspectiveOrigin: '50% 44%',
				}}
			>
				<Interactive.Div
					name="Tilted copy-context menu"
					style={{
						position: 'absolute',
						left: '50%',
						top: '44%',
						width: 1604,
						height: 1440,
						translate: '-1180px -525px',
						transformOrigin: '1180px 525px',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: 2.1,
					}}
				>
					<CopyContextCaptureComposition />
				</Interactive.Div>
			</div>
		</Sequence>
	);
};

export const MotionBlurCopyContext = Interactive.create({
	Component: MotionBlurCopyContextContent,
	layout: 'absolute-fill',
	schema: {},
});
