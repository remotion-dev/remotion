import {loadFont} from '@remotion/google-fonts/Inter';
import {makeCallout} from '@remotion/shapes';
import React from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700'],
});

export const ProductDiscountCallout = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const discountCallout = makeCallout({
		width: 260,
		height: 86,
		pointerLength: 24,
		pointerBaseWidth: 42,
		pointerPosition: 0.5,
		pointerDirection: 'down',
		cornerRadius: 14,
	});

	return (
		<Interactive.Div
			name="Container"
			style={{
				WebkitFontSmoothing: 'antialiased',
				color: '#161714',
				fontFamily: 'Inter',
				height: '100%',
				isolation: 'isolate',
				opacity: interpolate(
					frame,
					[0, 8, durationInFrames - 14, durationInFrames - 1],
					[0, 1, 1, 0],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				overflow: 'hidden',
				position: 'relative',
				translate: interpolate(
					frame,
					[0, 16, durationInFrames - 16, durationInFrames - 1],
					['-150px 0px', '0px 0px', '0px 0px', '110px 0px'],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: '100%',
				willChange: 'transform, opacity',
			}}
		>
			<CanvasImage
				fit="contain"
				height={430}
				name="Product image"
				src="https://remotion.media/elements/product-discount-callout-gray-runner.png"
				style={{
					filter: 'drop-shadow(0px 28px 20px rgba(22, 23, 20, 0.18))',
					left: 50,
					position: 'absolute',
					scale: interpolate(frame, [0, 18], [0.98, 1], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					top: 0,
					willChange: 'transform',
				}}
				width={800}
			/>
			<Interactive.Div
				name="Discount callout"
				style={{
					height: 110,
					left: 150,
					position: 'absolute',
					rotate: interpolate(
						frame,
						[50, 57, 64, 70, 76],
						['0deg', '10deg', '-7deg', '3deg', '0deg'],
						{
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					top: 360,
					transformOrigin: '50% 100%',
					width: 260,
					willChange: 'transform',
				}}
			>
				<svg
					height={discountCallout.height}
					style={{
						filter: 'drop-shadow(0px 9px 8px rgba(22, 23, 20, 0.16))',
						height: '100%',
						overflow: 'visible',
						position: 'absolute',
						width: '100%',
					}}
					viewBox={`0 0 ${discountCallout.width} ${discountCallout.height}`}
					width={discountCallout.width}
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d={discountCallout.path} fill="#d8ff52" />
				</svg>
				<Interactive.Div
					name="Discount text"
					style={{
						alignItems: 'center',
						display: 'flex',
						fontSize: 43,
						fontWeight: 700,
						height: 86,
						justifyContent: 'center',
						letterSpacing: -1.8,
						lineHeight: 1,
						position: 'relative',
					}}
				>
					20% OFF
				</Interactive.Div>
			</Interactive.Div>
			<Interactive.Div
				name="Current price"
				style={{
					fontSize: 104,
					fontVariantNumeric: 'tabular-nums',
					fontWeight: 700,
					left: 150,
					letterSpacing: -6,
					lineHeight: 0.86,
					maxWidth: 270,
					overflow: 'hidden',
					position: 'absolute',
					textOverflow: 'ellipsis',
					top: 490,
					whiteSpace: 'nowrap',
				}}
			>
				$79
			</Interactive.Div>
			<Interactive.Div
				name="Original price"
				style={{
					color: '#6f736a',
					fontSize: 28,
					fontWeight: 600,
					left: 154,
					lineHeight: 1,
					maxWidth: 245,
					overflow: 'hidden',
					position: 'absolute',
					textDecoration: 'line-through',
					textDecorationThickness: 2,
					textOverflow: 'ellipsis',
					top: 590,
					whiteSpace: 'nowrap',
				}}
			>
				$99
			</Interactive.Div>
			<div
				style={{
					backgroundColor: '#c9cdc4',
					height: 118,
					left: 444,
					position: 'absolute',
					top: 493,
					width: 2,
				}}
			/>
			<div
				style={{
					left: 474,
					maxWidth: 400,
					overflow: 'hidden',
					position: 'absolute',
					top: 492,
				}}
			>
				<Interactive.Div
					name="Product name"
					style={{
						fontSize: 38,
						fontWeight: 700,
						letterSpacing: -1.4,
						lineHeight: 1.05,
					}}
				>
					Everyday Runner
				</Interactive.Div>
				<Interactive.Div
					name="Product description"
					style={{
						color: '#5e6259',
						fontSize: 23,
						fontWeight: 500,
						lineHeight: 1.3,
						marginTop: 12,
					}}
				>
					Lightweight comfort for daily miles.
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};
