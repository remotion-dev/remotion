import {loadFont} from '@remotion/google-fonts/Inter';
import {
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600'],
});

export const ProductOffer = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Container"
			style={{
				WebkitFontSmoothing: 'antialiased',
				backgroundColor: '#f3eee4',
				borderRadius: 32,
				boxSizing: 'border-box',
				color: '#1d1d19',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'Inter',
				height: '100%',
				isolation: 'isolate',
				opacity: interpolate(
					frame,
					[0, 10, durationInFrames - 10, durationInFrames - 1],
					[0, 1, 1, 0],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				overflow: 'hidden',
				scale: interpolate(
					frame,
					[0, 18, durationInFrames - 10, durationInFrames - 1],
					[0.97, 1, 1, 0.98],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				transform: 'perspective(100px)',
				translate: interpolate(
					frame,
					[0, 18, durationInFrames - 10, durationInFrames - 1],
					['0px 34px', '0px 0px', '0px 0px', '0px -24px'],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: '100%',
				willChange: 'transform',
			}}
		>
			<Interactive.Div
				name="Image panel"
				style={{
					alignItems: 'center',
					backgroundColor: '#f7c900',
					display: 'flex',
					flexShrink: 0,
					height: 600,
					justifyContent: 'center',
					opacity: interpolate(frame, [0, 24], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					overflow: 'hidden',
					position: 'relative',
					translate: interpolate(frame, [0, 28], ['0px -24px', '0px 0px'], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					width: '100%',
				}}
			>
				<Img
					alt=""
					name="Product image"
					src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&fit=crop&w=1400&q=90"
					style={{
						height: '100%',
						objectFit: 'cover',
						objectPosition: '50% 50%',
						scale: interpolate(frame, [0, durationInFrames - 1], [1.06, 1], {
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						width: '100%',
					}}
				/>

				<Interactive.Div
					name="Discount badge"
					style={{
						backgroundColor: '#1d1d19',
						borderRadius: 14,
						color: '#ffffff',
						fontSize: 24,
						fontWeight: 600,
						maxWidth: 220,
						opacity: interpolate(frame, [18, 34], [0, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						overflow: 'hidden',
						padding: '14px 18px',
						position: 'absolute',
						right: 36,
						scale: interpolate(frame, [18, 34], [0.78, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						textOverflow: 'ellipsis',
						top: 36,
						transform: 'perspective(100px)',
						whiteSpace: 'nowrap',
						willChange: 'transform',
					}}
				>
					30% off
				</Interactive.Div>
			</Interactive.Div>
			<Interactive.Div
				name="Offer details"
				style={{
					alignItems: 'flex-end',
					backgroundColor: '#f3eee4',
					boxSizing: 'border-box',
					display: 'flex',
					flex: 1,
					gap: 40,
					justifyContent: 'space-between',
					minHeight: 0,
					minWidth: 0,
					opacity: interpolate(frame, [8, 30], [0, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					padding: '40px 44px 42px',
					transform: 'perspective(100px)',
					translate: interpolate(frame, [8, 32], ['0px 26px', '0px 0px'], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					width: '100%',
					willChange: 'transform',
				}}
			>
				<Interactive.H2
					name="Product title"
					style={{
						WebkitBoxOrient: 'vertical',
						WebkitLineClamp: 2,
						display: '-webkit-box',
						flex: 1,
						fontSize: 64,
						fontWeight: 600,
						letterSpacing: -2.8,
						lineHeight: 1.02,
						margin: 0,
						maxWidth: '14ch',
						minWidth: 0,
						overflow: 'hidden',
						textWrap: 'balance',
					}}
				>
					Studio Wireless Headphones
				</Interactive.H2>

				<div
					style={{
						alignItems: 'flex-end',
						display: 'flex',
						flexDirection: 'column',
						flexShrink: 0,
						fontVariantNumeric: 'tabular-nums',
						gap: 12,
						maxWidth: 280,
						minWidth: 0,
					}}
				>
					<Interactive.Div
						name="Current price"
						style={{
							fontSize: 82,
							fontWeight: 600,
							letterSpacing: -3.4,
							lineHeight: 0.9,
							maxWidth: '100%',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							transform: 'perspective(100px)',
							whiteSpace: 'nowrap',
							willChange: 'transform',
						}}
					>
						$179
					</Interactive.Div>
					<Interactive.Div
						name="Original price"
						style={{
							color: '#77746b',
							fontSize: 28,
							fontWeight: 500,
							maxWidth: '100%',
							overflow: 'hidden',
							textDecoration: 'line-through',
							textDecorationThickness: 2,
							textOverflow: 'ellipsis',
							transform: 'perspective(100px)',
							whiteSpace: 'nowrap',
							willChange: 'transform',
						}}
					>
						$249
					</Interactive.Div>
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
