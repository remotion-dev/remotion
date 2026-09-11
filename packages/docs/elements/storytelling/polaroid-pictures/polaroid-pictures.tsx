import {fontFamily, loadFont} from '@remotion/google-fonts/Caveat';
import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	weights: ['600'],
	subsets: ['latin'],
});

export const PolaroidPictures = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<div
			style={{
				color: '#2d2620',
				height: 640,
				position: 'relative',
				scale: interpolate(frame, [58, durationInFrames - 32], [1, 1.035], {
					easing: Easing.inOut(Easing.quad),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					output: 'perceptual-scale',
				}),
				translate: interpolate(
					frame,
					[58, durationInFrames - 32],
					['0px 0px', '0px -18px'],
					{
						easing: Easing.inOut(Easing.quad),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: 1480,
				willChange: 'transform',
			}}
		>
			<Interactive.Div
				name="Photo 1 card"
				style={{
					backgroundColor: '#fffdfa',
					boxShadow:
						'0 24px 52px rgba(8, 5, 3, 0.16), 0 4px 12px rgba(8, 5, 3, 0.08), inset 0 0 0 1px rgba(80, 62, 46, 0.05)',
					boxSizing: 'border-box',
					height: 520,
					left: 100,
					opacity: interpolate(
						frame,
						[8, 16, durationInFrames - 30, durationInFrames - 1],
						[0, 1, 1, 0],
						{
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '22px 22px 16px',
					position: 'absolute',
					rotate: interpolate(
						frame,
						[8, 34, durationInFrames - 30, durationInFrames - 1],
						['-20deg', '-8deg', '-8deg', '-18deg'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[durationInFrames - 30, durationInFrames - 1],
						[1, 1.08],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					top: 85,
					translate: interpolate(
						frame,
						[8, 34, durationInFrames - 30, durationInFrames - 1],
						['-620px 260px', '0px 0px', '0px 0px', '-760px -120px'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 420,
					willChange: 'opacity, transform',
					zIndex: 1,
				}}
			>
				<Interactive.Div
					name="Photo 1 tape"
					style={{
						backgroundColor: '#d9c58f',
						boxShadow: '0 2px 8px rgba(67, 47, 29, 0.14)',
						height: 48,
						left: 135,
						opacity: 0.68,
						position: 'absolute',
						rotate: '-5deg',
						top: -21,
						width: 150,
						zIndex: 2,
						translate: '-3.3px -12.3px',
					}}
				/>
				<div
					style={{
						backgroundColor: '#d8cbb8',
						height: 380,
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<Img
						name="Photo 1"
						alt=""
						src="https://remotion.media/transition-bg-blue.jpg"
						style={{
							height: '100%',
							objectFit: 'cover',
							width: '100%',
						}}
					/>
					<div
						style={{
							alignItems: 'center',
							color: 'white',
							display: 'flex',
							fontFamily: 'sans-serif',
							fontSize: 160,
							fontWeight: 900,
							inset: 0,
							justifyContent: 'center',
							position: 'absolute',
							textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
						}}
					>
						A
					</div>
				</div>
				<Interactive.Div
					name="Photo 1 caption"
					style={{
						alignItems: 'center',
						color: '#2d2620',
						display: 'flex',
						fontFamily,
						fontSize: 44,
						fontWeight: 600,
						height: 84,
						justifyContent: 'center',
						lineHeight: 1,
						marginTop: 8,
						textAlign: 'center',
					}}
				>
					scene A
				</Interactive.Div>
			</Interactive.Div>

			<Interactive.Div
				name="Photo 2 card"
				style={{
					backgroundColor: '#fffdfa',
					boxShadow:
						'0 28px 58px rgba(8, 5, 3, 0.18), 0 5px 14px rgba(8, 5, 3, 0.08), inset 0 0 0 1px rgba(80, 62, 46, 0.05)',
					boxSizing: 'border-box',
					height: 520,
					left: 530,
					opacity: interpolate(
						frame,
						[20, 28, durationInFrames - 28, durationInFrames - 1],
						[0, 1, 1, 0],
						{
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '22px 22px 16px',
					position: 'absolute',
					rotate: interpolate(
						frame,
						[20, 46, durationInFrames - 28, durationInFrames - 1],
						['16deg', '6deg', '6deg', '15deg'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[durationInFrames - 28, durationInFrames - 1],
						[1, 1.1],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					top: 35,
					translate: interpolate(
						frame,
						[20, 46, durationInFrames - 28, durationInFrames - 1],
						['340px -620px', '0px 0px', '0px 0px', '280px -720px'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 420,
					willChange: 'opacity, transform',
					zIndex: 2,
				}}
			>
				<Interactive.Div
					name="Photo 2 tape"
					style={{
						backgroundColor: '#d9c58f',
						boxShadow: '0 2px 8px rgba(67, 47, 29, 0.14)',
						height: 48,
						left: 135,
						opacity: 0.68,
						position: 'absolute',
						rotate: '4deg',
						top: -21,
						width: 150,
						zIndex: 2,
					}}
				/>
				<div
					style={{
						backgroundColor: '#d8cbb8',
						height: 380,
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<Img
						name="Photo 2"
						alt=""
						src="https://remotion.media/transition-bg-pink.jpg"
						style={{
							height: '100%',
							objectFit: 'cover',
							width: '100%',
						}}
					/>
					<div
						style={{
							alignItems: 'center',
							color: 'white',
							display: 'flex',
							fontFamily: 'sans-serif',
							fontSize: 160,
							fontWeight: 900,
							inset: 0,
							justifyContent: 'center',
							position: 'absolute',
							textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
						}}
					>
						B
					</div>
				</div>
				<Interactive.Div
					name="Photo 2 caption"
					style={{
						alignItems: 'center',
						color: '#2d2620',
						display: 'flex',
						fontFamily,
						fontSize: 46,
						fontWeight: 600,
						height: 84,
						justifyContent: 'center',
						lineHeight: 1,
						marginTop: 8,
						textAlign: 'center',
					}}
				>
					scene B
				</Interactive.Div>
			</Interactive.Div>

			<Interactive.Div
				name="Photo 3 card"
				style={{
					backgroundColor: '#fffdfa',
					boxShadow:
						'0 32px 64px rgba(8, 5, 3, 0.2), 0 6px 16px rgba(8, 5, 3, 0.09), inset 0 0 0 1px rgba(80, 62, 46, 0.05)',
					boxSizing: 'border-box',
					height: 520,
					left: 960,
					opacity: interpolate(
						frame,
						[32, 40, durationInFrames - 26, durationInFrames - 1],
						[0, 1, 1, 0],
						{
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					padding: '22px 22px 16px',
					position: 'absolute',
					rotate: interpolate(
						frame,
						[32, 58, durationInFrames - 26, durationInFrames - 1],
						['15deg', '-3deg', '-3deg', '10deg'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[durationInFrames - 26, durationInFrames - 1],
						[1, 1.12],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					top: 85,
					translate: interpolate(
						frame,
						[32, 58, durationInFrames - 26, durationInFrames - 1],
						['680px 380px', '0px 0px', '0px 0px', '820px 240px'],
						{
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.bezier(0.16, 1, 0.3, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 420,
					willChange: 'opacity, transform',
					zIndex: 3,
				}}
			>
				<Interactive.Div
					name="Photo 3 tape"
					style={{
						backgroundColor: '#d9c58f',
						boxShadow: '0 2px 8px rgba(67, 47, 29, 0.14)',
						height: 48,
						left: 135,
						opacity: 0.68,
						position: 'absolute',
						rotate: '-2deg',
						top: -21,
						width: 150,
						zIndex: 2,
					}}
				/>
				<div
					style={{
						backgroundColor: '#d8cbb8',
						height: 380,
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<Img
						name="Photo 3"
						alt=""
						src="https://remotion.media/transition-bg-blue.jpg"
						style={{
							filter: 'hue-rotate(-65deg)',
							height: '100%',
							objectFit: 'cover',
							width: '100%',
						}}
					/>
					<div
						style={{
							alignItems: 'center',
							color: 'white',
							display: 'flex',
							fontFamily: 'sans-serif',
							fontSize: 160,
							fontWeight: 900,
							inset: 0,
							justifyContent: 'center',
							position: 'absolute',
							textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
						}}
					>
						C
					</div>
				</div>
				<Interactive.Div
					name="Photo 3 caption"
					style={{
						alignItems: 'center',
						color: '#2d2620',
						display: 'flex',
						fontFamily,
						fontSize: 44,
						fontWeight: 600,
						height: 84,
						justifyContent: 'center',
						lineHeight: 1,
						marginTop: 8,
						textAlign: 'center',
					}}
				>
					scene C
				</Interactive.Div>
			</Interactive.Div>
		</div>
	);
};
