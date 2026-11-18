import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {
	CanvasImage,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const scrollStartInSeconds = 0.65;
const zoomEndInSeconds = 4.1;

const MotionBlurGuide = ({isMoving}: {readonly isMoving: boolean}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const pageScale = width / 900;
	const usageCenterY = 2919 * pageScale;
	const zoomFrames = [2.5 * fps, zoomEndInSeconds * fps];
	const easing = Easing.bezier(0.42, 0, 0.58, 1);
	const GuideImage = isMoving ? Img : CanvasImage;

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: '-25% 0',
					overflow: 'hidden',
					translate: interpolate(
						frame,
						zoomFrames,
						[`${width * 0.166}px -22px`, `${width * 0.292}px -32px`],
						{
							easing,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					rotate: EXPLORE_CAMERA_ANGLE,
					scale:
						1.2 *
						interpolate(frame, zoomFrames, [1.16, 1.55], {
							easing,
							output: 'perceptual-scale',
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
				}}
			>
				<GuideImage
					name="Motion blur guide"
					src="https://remotion.media/motion-blur-2026-11-17/motion-blur-guide-e2ee21b8ae72.png"
					style={{
						position: 'absolute',
						left: 0,
						top: height / 4,
						width,
						height: 6408 * pageScale,
						translate: interpolate(
							frame,
							[scrollStartInSeconds * fps, 2.8 * fps],
							['0px 0px', `0px ${height / 2 - usageCenterY}px`],
							{
								easing,
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
					}}
				/>
			</div>
		</div>
	);
};

const MotionBlurDocumentationContent = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const isMoving =
		frame + 1 >= scrollStartInSeconds * fps && frame < zoomEndInSeconds * fps;

	return (
		<HtmlInCanvasMotionBlur
			name="Guide scroll and zoom motion blur"
			width={width}
			height={height}
			shutterAngle={240}
			samples={12}
			disabled={!isMoving}
		>
			<MotionBlurGuide isMoving={isMoving} />
		</HtmlInCanvasMotionBlur>
	);
};

export const MotionBlurDocumentation = Interactive.create({
	Component: MotionBlurDocumentationContent,
	layout: 'absolute-fill',
	schema: {},
});
