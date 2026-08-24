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
	weights: ['600', '700'],
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
					backgroundImage:
						'linear-gradient(90deg, rgba(5, 11, 20, 0.84) 0%, rgba(5, 11, 20, 0.42) 62%, rgba(5, 11, 20, 0) 100%)',
					borderLeft: '3px solid #8fd3ff',
					boxSizing: 'border-box',
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
					fontSize: 48,
					fontWeight: 600,
					left: 70,
					letterSpacing: -1.5,
					lineHeight: 1.08,
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
					padding: '22px 34px 24px 30px',
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
					textShadow: '0 3px 20px rgba(0, 0, 0, 0.75)',
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
					backgroundImage:
						'linear-gradient(270deg, rgba(5, 11, 20, 0.84) 0%, rgba(5, 11, 20, 0.42) 62%, rgba(5, 11, 20, 0) 100%)',
					borderRight: '3px solid #ffd7a3',
					boxSizing: 'border-box',
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
					fontSize: 43,
					fontWeight: 600,
					letterSpacing: -1.3,
					lineHeight: 1.1,
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
					padding: '22px 30px 24px 34px',
					position: 'absolute',
					right: 55,
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
					textAlign: 'right',
					textShadow: '0 3px 20px rgba(0, 0, 0, 0.75)',
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
					width: 555,
					willChange: 'filter, opacity, transform',
				}}
			>
				I’m still in Berlin.
			</Interactive.Div>
			<Interactive.Div
				name="Message 3"
				style={{
					backgroundImage:
						'linear-gradient(90deg, rgba(5, 11, 20, 0.92) 0%, rgba(5, 11, 20, 0.48) 64%, rgba(5, 11, 20, 0) 100%)',
					borderLeft: '4px solid #ffcc8a',
					bottom: 64,
					boxSizing: 'border-box',
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
					fontSize: 68,
					fontWeight: 700,
					left: 185,
					letterSpacing: -2.4,
					lineHeight: 1,
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
					padding: '20px 34px 22px 30px',
					position: 'absolute',
					textShadow: '0 3px 22px rgba(0, 0, 0, 0.8)',
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
					width: 430,
					willChange: 'filter, opacity, transform',
				}}
			>
				Then who waved back?
			</Interactive.Div>
		</Interactive.Div>
	);
};
