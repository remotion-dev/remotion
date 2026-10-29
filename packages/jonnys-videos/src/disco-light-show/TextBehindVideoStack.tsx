import {Video} from '@remotion/media';
import {
	Composition,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

const TextBehindVideoStackCompositionInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Video
				name="Background video"
				src={asset('text-behind-video-background.webm')}
				from={0}
				trimBefore={330}
				durationInFrames={3343}
				muted
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
					// Keep the outline 2px wide after the layer's scale.
					outline: `${2 / 0.31}px solid #2684ff`,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[58, 84],
						['242.4px 50px', '242.4px 416px'],
						{
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<Video
				name="Text video"
				src={asset('text-behind-video-text.webm')}
				from={-625}
				trimBefore={330}
				durationInFrames={3343}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
					// Keep the outline 2px wide after the layer's scale.
					outline: `${2 / 0.31}px solid #2684ff`,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[58, 84],
						['242.4px 416px', '242.4px 416px'],
						{
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<Video
				name="Foreground video"
				src={asset('text-behind-video-foreground.webm')}
				from={0}
				trimBefore={330}
				durationInFrames={3343}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
					// Keep the outline 2px wide after the layer's scale.
					outline: `${2 / 0.31}px solid #2684ff`,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[58, 84],
						['242.4px 782px', '242.4px 416px'],
						{
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
		</>
	);
};

export const TextBehindVideoStack: React.FC = () => {
	return (
		<Composition
			id="TextBehindVideoStack"
			component={TextBehindVideoStackComposition}
			durationInFrames={3343}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={{style: {overflow: 'hidden'}}}
		/>
	);
};

export const TextBehindVideoStackComposition = Interactive.create({
	Component: TextBehindVideoStackCompositionInner,
	layout: 'absolute-fill',
});
