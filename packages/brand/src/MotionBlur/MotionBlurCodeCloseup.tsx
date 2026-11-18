import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	HtmlInCanvas,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const MotionBlurCodeCloseupContent = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	return (
		<HtmlInCanvas
			name="Tilted motion blur code with moving focus"
			width={width}
			height={height}
			style={{backgroundColor: '#131414'}}
			effects={[
				linearProgressiveBlur({
					start: [
						0.5,
						interpolate(frame, [0, 2.6 * fps], [0.2, 0.85], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					],
					end: [
						0.5,
						interpolate(frame, [0, 2.6 * fps], [0.8, 1.45], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					],
					endBlur: 18,
				}),
			]}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					perspective: 1600,
					perspectiveOrigin: '50% 50%',
				}}
			>
				<Img
					name="Triangle motion blur wrapper in Monaco"
					src="https://remotion.media/motion-blur-2026-11-17/code-closeup-4ba50e55de98.png"
					style={{
						position: 'absolute',
						left: '50%',
						top: '60%',
						width: 1000,
						height: 760,
						translate: interpolate(
							frame,
							[0, 2.6 * fps],
							['-410px -380px', '-425px -405px'],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
						transformOrigin: '500px 380px',
						rotate: EXPLORE_CAMERA_ANGLE,
						scale:
							Math.min(width / 1080, height / 960) *
							interpolate(frame, [0, 2.6 * fps], [1.28, 1.4], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
					}}
				/>
			</div>
		</HtmlInCanvas>
	);
};

export const MotionBlurCodeCloseup = Interactive.create({
	Component: MotionBlurCodeCloseupContent,
	layout: 'absolute-fill',
	schema: {},
});
