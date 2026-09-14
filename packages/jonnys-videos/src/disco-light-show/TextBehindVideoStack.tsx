import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Composition,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

export const TextBehindVideoStackComposition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Interactive.Div
				name="Background video"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
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
			>
				<Video
					src={asset('text-behind-video-background.webm')}
					from={0}
					trimBefore={330}
					durationInFrames={3343}
					muted
					style={{
						width: 1920,
						height: 1080,
						boxShadow: '0px 0px 50px rgba(255, 255, 255, 0.5)',
						borderRadius: 60,
					}}
					showInTimeline={false}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Text video"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
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
			>
				<Video
					src={asset('text-behind-video-text.webm')}
					from={-625}
					trimBefore={330}
					durationInFrames={3343}
					style={{
						width: 1920,
						height: 1080,
						boxShadow: '0px 0px 50px rgba(255, 255, 255, 0.5)',
						borderRadius: 60,
					}}
					premountFor={30}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Foreground video"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					scale: 0.31,
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
			>
				<Video
					src={asset('text-behind-video-foreground.webm')}
					from={0}
					trimBefore={330}
					durationInFrames={3343}
					style={{
						width: 1920,
						height: 1080,
						boxShadow: '0px 0px 50px rgba(255, 255, 255, 0.5)',
						borderRadius: 60,
					}}
					showInTimeline={false}
				/>
			</Interactive.Div>
		</AbsoluteFill>
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
		/>
	);
};
