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
	const sampleCount = 5;
	const shutterAngle = 240;
	const centerFrame = (47 / 30) * fps;
	const blendStart = 3.3 * fps;

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
					transform: 'scaleX(-1)',
					transformOrigin: '50% 50%',
				}}
			>
				<Interactive.Div
					name="Sampled frames slideshow"
					style={{position: 'absolute', inset: 0}}
				>
					{Array.from({length: sampleCount}, (_, index) => (
						<div
							key={index}
							style={{
								position: 'absolute',
								inset: 0,
								backgroundColor: '#F8FAFC',
								opacity: frame >= (index * blendStart) / sampleCount ? 1 : 0,
							}}
						>
							<Freeze
								frame={
									centerFrame +
									((index + 0.5) / sampleCount - 0.5) * (shutterAngle / 360)
								}
							>
								<SpinningRemotionTriangle />
							</Freeze>
						</div>
					))}
				</Interactive.Div>
				<Interactive.Div
					name="Blended motion blur result"
					from={blendStart}
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: '#F8FAFC',
						opacity: interpolate(frame, [blendStart, 3.6 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Freeze frame={centerFrame}>
						<HtmlInCanvasMotionBlur
							name={`Average of the ${sampleCount} sampled frames`}
							width={1080}
							height={960}
							shutterAngle={shutterAngle}
							samples={sampleCount}
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
