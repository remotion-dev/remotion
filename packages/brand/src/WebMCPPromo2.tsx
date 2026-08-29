import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const WebMCPPromo2Preview = () => {
	const frame = useCurrentFrame();
	const cursorArrivalProgress = interpolate(frame, [107, 126], [0, 1], {
		easing: Easing.bezier(0.22, 0.75, 0.28, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorHoldProgress = interpolate(frame, [126, 176], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorExitProgress = interpolate(frame, [176, 219], [0, 1], {
		easing: Easing.bezier(0.32, 0.05, 0.3, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorX =
		frame < 126
			? 1063.3828125 +
				(1030.5 - 1063.3828125) * cursorArrivalProgress +
				Math.sin(Math.PI * cursorArrivalProgress) * 2.9 +
				Math.sin(Math.PI * 2 * cursorArrivalProgress) *
					Math.sin(Math.PI * cursorArrivalProgress) *
					0.45
			: frame < 176
				? 1030.5 + (1030.500057 - 1030.5) * cursorHoldProgress
				: 1030.500057 +
					(2460.9 - 1030.500057) * cursorExitProgress +
					Math.sin(Math.PI * cursorExitProgress) * 0.5 +
					Math.sin(Math.PI * 2 * cursorExitProgress) *
						Math.sin(Math.PI * cursorExitProgress) *
						0.7;
	const cursorY =
		frame < 126
			? 1269.08203125 +
				(1147.1 - 1269.08203125) * cursorArrivalProgress -
				Math.sin(Math.PI * cursorArrivalProgress) * 0.8 +
				Math.cos(Math.PI * 2 * cursorArrivalProgress) *
					Math.sin(Math.PI * cursorArrivalProgress) *
					0.35
			: frame < 176
				? 1147.1 + (1147.100211 - 1147.1) * cursorHoldProgress
				: 1147.100211 +
					(1046.8 - 1147.100211) * cursorExitProgress -
					Math.sin(Math.PI * cursorExitProgress) * 7 +
					Math.cos(Math.PI * 2 * cursorExitProgress) *
						Math.sin(Math.PI * cursorExitProgress) *
						0.65;

	return (
		<AbsoluteFill
			style={{
				width: 2358,
				height: 2586,
			}}
		>
			<Video
				src="https://remotion.media/webmcp-promo/interaction-recording-v2.mp4"
				style={{
					position: 'absolute',
				}}
				durationInFrames={303}
				from={-31}
				premountFor={30}
			/>
			<Video
				src="https://remotion.media/webmcp-promo/interaction-recording-v2.mp4"
				style={{
					position: 'absolute',
				}}
				from={247}
				durationInFrames={135}
				trimBefore={530}
				freeze={36}
				premountFor={30}
			/>
			<Video
				src="https://remotion.media/webmcp-promo/interaction-recording-v2.mp4"
				style={{
					position: 'absolute',
				}}
				from={380}
				durationInFrames={735}
				trimBefore={598}
				premountFor={30}
			/>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[-8, -4, -3, -2, 0, 8, 9, 60, 61, 126],
					[
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
						'ns-resize',
						'auto',
						'default',
					],
					{
						easing: [
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
							Easing.step1,
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					scale: interpolate(
						frame,
						[-21, 24, 28, 140, 143, 148],
						[3, 2.7, 3, 3, 2.7, 3],
						{
							easing: [
								Easing.step1,
								Easing.step1,
								Easing.step1,
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.step1,
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: `${cursorX}px ${cursorY}px`,
				}}
				durationInFrames={254}
			/>
		</AbsoluteFill>
	);
};

export const WebMCPPromo2 = () => {
	return (
		<Composition
			id="WebMCPPromo2"
			component={WebMCPPromo2Preview}
			width={2358}
			height={2586}
			fps={60}
			durationInFrames={400}
		/>
	);
};
