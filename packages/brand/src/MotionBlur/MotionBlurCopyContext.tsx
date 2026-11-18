import {
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import {CopyContextCaptureComposition} from '../AgenticallyProgrammatically/CopyContextCaptureComposition';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

export const MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES = 56;
const COPY_CONTEXT_CAPTURE_DURATION_IN_FRAMES = 82;

const MotionBlurCopyContextContent = () => {
	const frame = useCurrentFrame();
	const pan = interpolate(frame, [20, 40], [0, 1], {
		easing: Easing.bezier(0.42, 0, 0.58, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const focusX = interpolate(pan, [0, 1], [940, 1180]);
	const focusY = interpolate(pan, [0, 1], [1060, 525]);

	return (
		<Sequence
			name="Copy context for agents click"
			trimBefore={33}
			durationInFrames={COPY_CONTEXT_CAPTURE_DURATION_IN_FRAMES}
			playbackRate={
				COPY_CONTEXT_CAPTURE_DURATION_IN_FRAMES /
				MOTION_BLUR_COPY_CONTEXT_DURATION_IN_FRAMES
			}
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
						translate: `${-focusX}px ${-focusY}px`,
						transformOrigin: `${focusX}px ${focusY}px`,
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: interpolate(pan, [0, 1], [1.65, 2.1], {
							output: 'perceptual-scale',
						}),
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
