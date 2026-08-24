import {fontFamily, loadFont} from '@remotion/google-fonts/Inter';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500'],
});

export const OnScreenMessages = () => {
	const sequenceFrame = useCurrentFrame();
	const {durationInFrames: sequenceDurationInFrames} = useVideoConfig();
	// Compress the treatment when its wrapping Sequence is shorter than 150 frames.
	const durationInFrames = Math.max(sequenceDurationInFrames, 150);
	const frame =
		sequenceFrame *
		((durationInFrames - 1) / Math.max(1, sequenceDurationInFrames - 1));

	return (
		<Interactive.Div
			name="Container"
			style={{
				color: '#f8fafc',
				fontFamily,
				height: 680,
				isolation: 'isolate',
				position: 'relative',
				width: 1260,
			}}
		>
			<Interactive.Div
				name="Message 1"
				style={{
					backgroundColor: '#e9e9eb',
					borderRadius: '38px 38px 38px 12px',
					boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
					boxSizing: 'border-box',
					color: '#111111',
					filter: `blur(${interpolate(
						frame,
						[8, 26, durationInFrames - 26, durationInFrames - 1],
						[12, 0, 0, 8],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}px)`,
					fontSize: 46,
					fontWeight: 500,
					left: 70,
					letterSpacing: -1.4,
					lineHeight: 1.12,
					opacity: interpolate(
						frame,
						[
							8,
							26,
							40,
							58,
							72,
							92,
							durationInFrames - 26,
							durationInFrames - 1,
						],
						[0, 1, 1, 0.64, 0.64, 0.44, 0.44, 0],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '24px 32px 26px',
					position: 'absolute',
					scale: interpolate(
						frame,
						[8, 26, durationInFrames - 26, durationInFrames - 1],
						[0.94, 1, 1, 1.015],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					top: 72,
					translate: interpolate(
						frame,
						[8, 26, durationInFrames - 26, durationInFrames - 1],
						['-42px 10px', '0px 0px', '0px 0px', '-24px -20px'],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 560,
					willChange: 'filter, opacity, transform',
				}}
			>
				I just saw you at the station.
			</Interactive.Div>
			<Interactive.Div
				name="Message 2"
				style={{
					backgroundColor: '#0a84ff',
					borderRadius: '38px 38px 12px 38px',
					boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
					boxSizing: 'border-box',
					color: '#ffffff',
					filter: `blur(${interpolate(
						frame,
						[40, 58, durationInFrames - 26, durationInFrames - 1],
						[12, 0, 0, 8],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}px)`,
					fontSize: 46,
					fontWeight: 500,
					letterSpacing: -1.4,
					lineHeight: 1.12,
					opacity: interpolate(
						frame,
						[40, 58, 72, 92, durationInFrames - 26, durationInFrames - 1],
						[0, 1, 1, 0.68, 0.68, 0],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '24px 32px 26px',
					position: 'absolute',
					right: 70,
					scale: interpolate(
						frame,
						[40, 58, durationInFrames - 26, durationInFrames - 1],
						[0.94, 1, 1, 1.015],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					top: 273,
					translate: interpolate(
						frame,
						[40, 58, durationInFrames - 26, durationInFrames - 1],
						['42px 10px', '0px 0px', '0px 0px', '24px -20px'],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 470,
					willChange: 'filter, opacity, transform',
				}}
			>
				I’m still in Berlin.
			</Interactive.Div>
			<Interactive.Div
				name="Message 3"
				style={{
					backgroundColor: '#e9e9eb',
					borderRadius: '38px 38px 38px 12px',
					bottom: 64,
					boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
					boxSizing: 'border-box',
					color: '#111111',
					filter: `blur(${interpolate(
						frame,
						[72, 92, durationInFrames - 26, durationInFrames - 1],
						[12, 0, 0, 8],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}px)`,
					fontSize: 46,
					fontWeight: 500,
					left: 185,
					letterSpacing: -1.4,
					lineHeight: 1.12,
					opacity: interpolate(
						frame,
						[72, 92, durationInFrames - 26, durationInFrames - 1],
						[0, 1, 1, 0],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '24px 32px 26px',
					position: 'absolute',
					translate: interpolate(
						frame,
						[72, 92, durationInFrames - 26, durationInFrames - 1],
						['-30px 24px', '0px 0px', '0px 0px', '-20px -24px'],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 560,
					willChange: 'filter, opacity, transform',
				}}
			>
				Then who waved back?
			</Interactive.Div>
		</Interactive.Div>
	);
};
