import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {RemotionTriangle} from '../HomepageAssets/RemotionTriangle';
import {
	getMotionBlurOutroScale,
	MOTION_BLUR_OUTRO_START_FRAME,
} from './MotionBlurOutro';

export const SpinningRemotionTriangle = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<RemotionTriangle
			frame={60}
			rotationY={interpolate(frame, [fps, 2.2 * fps], [0, Math.PI * 2], {
				easing: Easing.bezier(0.76, 0, 0.24, 1),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			scale={1.5}
			outlineStrokeWidth={0}
			outlineHandleSize={0}
		/>
	);
};

export const RemotionTriangleMotionBlur = () => {
	const {width, height} = useVideoConfig();

	return (
		<div style={{position: 'absolute', inset: 0, backgroundColor: '#F8FAFC'}}>
			<HtmlInCanvasMotionBlur
				name="Triangle motion blur"
				width={width}
				height={height}
				playbackRate={0.25}
				shutterAngle={360}
				samples={15}
			>
				<SpinningRemotionTriangle />
			</HtmlInCanvasMotionBlur>
		</div>
	);
};

const ShrinkingOutroTriangle = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = getMotionBlurOutroScale(
		frame + MOTION_BLUR_OUTRO_START_FRAME,
		fps,
		0,
	);

	return (
		<div style={{position: 'absolute', inset: 0, scale}}>
			<Sequence layout="none" playbackRate={0.85}>
				<SpinningRemotionTriangle />
			</Sequence>
		</div>
	);
};

export const MotionBlurOutroTriangle = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvasMotionBlur
			name="Spinning end-card triangle"
			width={width}
			height={height}
			shutterAngle={180}
			samples={15}
		>
			<ShrinkingOutroTriangle />
		</HtmlInCanvasMotionBlur>
	);
};
