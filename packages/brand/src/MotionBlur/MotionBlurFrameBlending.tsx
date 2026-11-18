import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {
	Freeze,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SpinningRemotionTriangle} from './RemotionTriangleMotionBlur';

const MotionBlurFrameBlendingContent = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#F8FAFC',
				overflow: 'hidden',
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
					scale: Math.min(width / 1080, height / 960) * 1.65,
					transformOrigin: '50% 50%',
				}}
			>
				<Interactive.Div
					name="Sampled frames slideshow"
					style={{position: 'absolute', inset: 0}}
				>
					{Array.from({length: 15}, (_, index) => (
						<div
							key={index}
							style={{
								position: 'absolute',
								inset: 0,
								backgroundColor: '#F8FAFC',
								opacity: frame >= index * 0.22 * fps ? 1 : 0,
							}}
						>
							<Freeze
								frame={
									(47 / 30) * fps + ((index + 0.5) / 15 - 0.5) * (240 / 360)
								}
							>
								<SpinningRemotionTriangle />
							</Freeze>
						</div>
					))}
				</Interactive.Div>
				<Interactive.Div
					name="Blended motion blur result"
					from={3.3 * fps}
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: '#F8FAFC',
						opacity: interpolate(frame, [3.3 * fps, 3.6 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Freeze frame={(47 / 30) * fps}>
						<HtmlInCanvasMotionBlur
							name="Average of the 15 sampled frames"
							width={1080}
							height={960}
							shutterAngle={240}
							samples={15}
						>
							<SpinningRemotionTriangle />
						</HtmlInCanvasMotionBlur>
					</Freeze>
				</Interactive.Div>
			</div>
		</div>
	);
};

export const MotionBlurFrameBlending = Interactive.create({
	Component: MotionBlurFrameBlendingContent,
	layout: 'absolute-fill',
	schema: {},
});
