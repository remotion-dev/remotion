import {loadFont} from '@remotion/google-fonts/Inter';
import {makeCallout} from '@remotion/shapes';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700', '800'],
});

export const ProductDiscountCallout = () => {
	const frame = useCurrentFrame();
	const discountCallout = makeCallout({
		width: 600,
		height: 300,
		pointerLength: 70,
		pointerBaseWidth: 130,
		pointerPosition: 0.5,
		pointerDirection: 'down',
		cornerRadius: 45,
	});

	return (
		<Interactive.Div
			name="Container"
			style={{
				WebkitFontSmoothing: 'antialiased',
				fontFamily: 'Inter',
				height: '100%',
				isolation: 'isolate',
				overflow: 'hidden',
				position: 'relative',
				width: '100%',
			}}
		>
			<Interactive.Div
				name="Discount callout"
				style={{
					height: 370,
					left: 80,
					position: 'absolute',
					rotate: interpolate(
						frame,
						[0, 7, 14, 20, 26],
						['0deg', '10deg', '-7deg', '3deg', '0deg'],
						{
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					top: 195,
					transformOrigin: '50% 100%',
					width: 600,
					willChange: 'transform',
				}}
			>
				<svg
					style={{
						height: '100%',
						overflow: 'visible',
						position: 'absolute',
						width: '100%',
					}}
					viewBox={`0 0 ${discountCallout.width} ${discountCallout.height}`}
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d={discountCallout.path} fill="#2563eb" />
				</svg>
				<Interactive.Div
					name="Discount text"
					style={{
						alignItems: 'center',
						color: '#ffffff',
						display: 'flex',
						fontSize: 180,
						fontWeight: 800,
						height: 300,
						justifyContent: 'center',
						letterSpacing: -7,
						lineHeight: 1,
						position: 'relative',
					}}
				>
					-20%
				</Interactive.Div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
