import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {RemotionTriangle} from '../HomepageAssets/RemotionTriangle';

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
				shutterAngle={0}
				samples={15}
			>
				<SpinningRemotionTriangle />
			</HtmlInCanvasMotionBlur>
		</div>
	);
};
