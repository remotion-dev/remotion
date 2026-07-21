import {loadFont} from '@remotion/google-fonts/Inter';
import React, {useState} from 'react';
import {Easing, Img, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600'],
});

export type ProductOfferData = {
	readonly availability: string | null;
	readonly brand: string | null;
	readonly ctaLabel: string;
	readonly currentPrice: string;
	readonly discountLabel: string | null;
	readonly imageAlt: string;
	readonly imageSrc: string;
	readonly name: string;
	readonly originalPrice: string | null;
};

export type ProductOfferProps = {
	readonly product?: ProductOfferData;
};

const previewProduct: ProductOfferData = {
	availability: 'Ships in 2 days',
	brand: 'Auraline',
	ctaLabel: 'Shop now',
	currentPrice: '$179',
	discountLabel: '30% off',
	imageAlt: 'Black over-ear headphones on a yellow background',
	imageSrc:
		'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&fit=crop&w=1400&q=90',
	name: 'Studio Wireless Headphones',
	originalPrice: '$249',
};

export const ProductOffer: React.FC<ProductOfferProps> = ({
	product = previewProduct,
}) => {
	const frame = useCurrentFrame();
	const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
	const imageHasFailed = failedImageSrc === product.imageSrc;

	return (
		<Interactive.Div
			name="Container"
			style={{
				backgroundColor: '#f3eee4',
				borderRadius: 32,
				boxSizing: 'border-box',
				color: '#1d1d19',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'Inter',
				height: '100%',
				isolation: 'isolate',
				opacity: interpolate(frame, [0, 18, 128, 149], [0, 1, 1, 0], {
					easing: Easing.bezier(0.16, 1, 0.3, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				overflow: 'hidden',
				outline: '2px solid rgba(29, 29, 25, 0.1)',
				outlineOffset: -2,
				scale: interpolate(frame, [0, 22, 128, 149], [0.97, 1, 1, 0.98], {
					easing: Easing.bezier(0.16, 1, 0.3, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				translate: interpolate(
					frame,
					[0, 22, 128, 149],
					['0px 34px', '0px 0px', '0px 0px', '0px -24px'],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: '100%',
			}}
		>
			<Interactive.Div
				name="Image panel"
				style={{
					alignItems: 'center',
					backgroundColor: '#f7c900',
					display: 'flex',
					flexShrink: 0,
					height: 500,
					justifyContent: 'center',
					opacity: interpolate(frame, [0, 24, 120, 144], [0, 1, 1, 0], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					overflow: 'hidden',
					position: 'relative',
					translate: interpolate(
						frame,
						[0, 28, 120, 144],
						['0px -24px', '0px 0px', '0px 0px', '0px -18px'],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: '100%',
				}}
			>
				{imageHasFailed ? (
					<div
						style={{
							alignItems: 'center',
							color: '#5e4c00',
							display: 'flex',
							fontSize: 24,
							fontWeight: 500,
							height: '100%',
							justifyContent: 'center',
							width: '100%',
						}}
					>
						Product image unavailable
					</div>
				) : (
					<Img
						alt={product.imageAlt}
						name="Product image"
						onError={() => setFailedImageSrc(product.imageSrc)}
						src={product.imageSrc}
						style={{
							height: '100%',
							objectFit: 'cover',
							objectPosition: '50% 54%',
							scale: interpolate(frame, [0, 120, 149], [1.06, 1, 1.035], {
								easing: Easing.inOut(Easing.quad),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							width: '100%',
						}}
					/>
				)}

				{product.discountLabel === null ? null : (
					<Interactive.Div
						name="Discount badge"
						style={{
							backgroundColor: '#1d1d19',
							borderRadius: 14,
							color: '#ffffff',
							fontSize: 24,
							fontWeight: 600,
							maxWidth: 220,
							opacity: interpolate(frame, [18, 34, 116, 134], [0, 1, 1, 0], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							overflow: 'hidden',
							padding: '14px 18px',
							position: 'absolute',
							right: 36,
							scale: interpolate(frame, [18, 34, 116, 134], [0.78, 1, 1, 0.9], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							textOverflow: 'ellipsis',
							top: 36,
							whiteSpace: 'nowrap',
						}}
					>
						{product.discountLabel}
					</Interactive.Div>
				)}
			</Interactive.Div>

			<Interactive.Div
				name="Offer details"
				style={{
					backgroundColor: '#f3eee4',
					boxSizing: 'border-box',
					display: 'flex',
					flex: 1,
					flexDirection: 'column',
					minHeight: 0,
					minWidth: 0,
					opacity: interpolate(frame, [8, 30, 120, 142], [0, 1, 1, 0], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					padding: '36px 42px 40px',
					translate: interpolate(
						frame,
						[8, 32, 120, 142],
						['0px 26px', '0px 0px', '0px 0px', '0px 18px'],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: '100%',
				}}
			>
				<div>
					<div
						style={{
							alignItems: 'baseline',
							display: 'flex',
							gap: 24,
							justifyContent: 'space-between',
							minWidth: 0,
						}}
					>
						{product.brand === null ? null : (
							<Interactive.Div
								name="Brand"
								style={{
									fontSize: 26,
									fontWeight: 500,
									minWidth: 0,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{product.brand}
							</Interactive.Div>
						)}
						{product.availability === null ? null : (
							<Interactive.Div
								name="Availability"
								style={{
									color: '#68665e',
									fontSize: 22,
									fontWeight: 500,
									marginLeft: 'auto',
									maxWidth: 360,
									opacity: interpolate(
										frame,
										[24, 42, 114, 134],
										[0, 1, 1, 0],
										{
											easing: Easing.bezier(0.16, 1, 0.3, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									),
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									translate: interpolate(
										frame,
										[24, 42, 114, 134],
										['0px 12px', '0px 0px', '0px 0px', '0px -8px'],
										{
											easing: Easing.bezier(0.16, 1, 0.3, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										},
									),
									whiteSpace: 'nowrap',
								}}
							>
								{product.availability}
							</Interactive.Div>
						)}
					</div>

					<Interactive.H2
						name="Product name"
						style={{
							WebkitBoxOrient: 'vertical',
							WebkitLineClamp: 2,
							display: '-webkit-box',
							fontSize: 64,
							fontWeight: 600,
							letterSpacing: -2.8,
							lineHeight: 1.02,
							margin: '20px 0 0',
							maxWidth: '16ch',
							overflow: 'hidden',
							textWrap: 'balance',
						}}
					>
						{product.name}
					</Interactive.H2>
				</div>

				<div
					style={{
						alignItems: 'flex-end',
						display: 'flex',
						gap: 32,
						justifyContent: 'space-between',
						marginTop: 'auto',
						minWidth: 0,
					}}
				>
					<Interactive.Div
						name="Price"
						style={{
							alignItems: 'baseline',
							display: 'flex',
							flex: 1,
							flexWrap: 'wrap',
							fontVariantNumeric: 'tabular-nums',
							gap: '6px 16px',
							minWidth: 0,
						}}
					>
						<span
							style={{
								fontSize: 78,
								fontWeight: 600,
								letterSpacing: -3.2,
								lineHeight: 0.9,
								maxWidth: '100%',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{product.currentPrice}
						</span>
						{product.originalPrice === null ? null : (
							<span
								style={{
									color: '#77746b',
									fontSize: 28,
									fontWeight: 500,
									maxWidth: '100%',
									overflow: 'hidden',
									textDecoration: 'line-through',
									textDecorationThickness: 2,
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{product.originalPrice}
							</span>
						)}
					</Interactive.Div>

					<Interactive.Div
						name="CTA"
						style={{
							alignItems: 'center',
							backgroundColor: '#1d1d19',
							borderRadius: 16,
							boxSizing: 'border-box',
							color: '#ffffff',
							display: 'flex',
							flexShrink: 0,
							fontSize: 24,
							fontWeight: 600,
							height: 78,
							justifyContent: 'center',
							opacity: interpolate(frame, [28, 46, 112, 132], [0, 1, 1, 0], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							overflow: 'hidden',
							padding: '0 24px',
							textOverflow: 'ellipsis',
							translate: interpolate(
								frame,
								[28, 46, 112, 132],
								['0px 18px', '0px 0px', '0px 0px', '0px -12px'],
								{
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							whiteSpace: 'nowrap',
							width: 258,
						}}
					>
						{product.ctaLabel}
					</Interactive.Div>
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
