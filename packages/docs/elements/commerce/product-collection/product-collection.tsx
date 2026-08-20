import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
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
	weights: ['500', '600', '700'],
});

type Product = {
	readonly title: string;
	readonly image: string;
	readonly imageFit: 'contain' | 'cover';
	readonly imageBackgroundColor: string;
	readonly price: string;
	readonly originalPrice: string | null;
	readonly discount: string | null;
};

const products: readonly Product[] = [
	{
		title: 'Cloudline Runner',
		image:
			'https://remotion.media/elements/product-discount-callout-gray-runner.png',
		imageFit: 'contain',
		imageBackgroundColor: '#dbe1e9',
		price: '$118',
		originalPrice: '$148',
		discount: '20% off',
	},
	{
		title: 'Minimal Steel Watch',
		image:
			'https://images.unsplash.com/photo-1523275335684-37898b6baf30?fm=jpg&fit=crop&w=900&q=90',
		imageFit: 'contain',
		imageBackgroundColor: '#deded8',
		price: '$185',
		originalPrice: null,
		discount: null,
	},
	{
		title: 'Studio Sunglasses',
		image:
			'https://images.unsplash.com/photo-1511499767150-a48a237f0083?fm=jpg&fit=crop&w=900&q=90',
		imageFit: 'cover',
		imageBackgroundColor: '#c8d8e6',
		price: '$94',
		originalPrice: '$125',
		discount: 'Save $31',
	},
	{
		title: 'Studio Headset',
		image:
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&fit=crop&w=900&q=90',
		imageFit: 'cover',
		imageBackgroundColor: '#f1c647',
		price: '$179',
		originalPrice: null,
		discount: 'New',
	},
	{
		title: 'Sculptural Table Lamp',
		image:
			'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?fm=jpg&fit=crop&w=900&q=90',
		imageFit: 'cover',
		imageBackgroundColor: '#e5b17a',
		price: '$149',
		originalPrice: null,
		discount: null,
	},
];

const ProductCard = ({
	product,
	index,
	count,
}: {
	readonly product: Product;
	readonly index: number;
	readonly count: number;
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const lastProductIndex = Math.max(0, count - 1);
	const rawScrollPosition = interpolate(
		frame,
		[24, durationInFrames - 28],
		[0, lastProductIndex],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const transitionIndex = Math.min(
		Math.floor(rawScrollPosition),
		Math.max(0, lastProductIndex - 1),
	);
	const transitionProgress = interpolate(
		rawScrollPosition - transitionIndex,
		[0.18, 0.82],
		[0, 1],
		{
			easing: Easing.inOut(Easing.cubic),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const scrollPosition = transitionIndex + transitionProgress;
	const unwrappedSlotPosition = index - scrollPosition;
	const slotPosition =
		count <= 2
			? unwrappedSlotPosition
			: ((((unwrappedSlotPosition + count / 2) % count) + count) % count) -
				count / 2;
	const distanceFromCenter = Math.abs(slotPosition);
	const visibility = interpolate(distanceFromCenter, [1.02, 1.18], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const entryStart = 8 + Math.min(index, 1) * 5;
	const entryProgress = interpolate(
		frame,
		[entryStart, entryStart + 18],
		[0, 1],
		{
			easing: Easing.bezier(0.16, 1, 0.3, 1),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const x = slotPosition * 270;
	const y = Math.min(distanceFromCenter, 1.3) * 36 + (1 - entryProgress) * 180;
	const rotation = slotPosition * 5.5;
	const cardScale = interpolate(distanceFromCenter, [0, 1.5], [1.02, 0.84], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const obscuredSidePadding = interpolate(
		distanceFromCenter,
		[0.5, 1],
		[22, 48],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	return (
		<div
			style={{
				height: 560,
				left: 360,
				top: 265,
				opacity: visibility * entryProgress,
				position: 'absolute',
				rotate: `${rotation}deg`,
				scale: cardScale * (0.86 + entryProgress * 0.14),
				transform: 'perspective(100px)',
				translate: `${x}px ${y}px`,
				width: 300,
				willChange: 'transform, opacity',
				zIndex: 100 - Math.round(distanceFromCenter * 20),
			}}
		>
			<Interactive.Div
				name="Product card"
				style={{
					backgroundColor: '#ffffff',
					boxSizing: 'border-box',
					color: '#1d1d19',
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					overflow: 'hidden',
					width: '100%',
				}}
			>
				<div
					style={{
						backgroundColor: product.imageBackgroundColor,
						height: 335,
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<Img
						alt={product.title}
						name="Product image"
						src={product.image}
						style={{
							height: '100%',
							objectFit: product.imageFit,
							objectPosition: '50% 50%',
							scale: interpolate(
								frame,
								[0, durationInFrames - 1],
								[1.06, 1.01],
								{
									easing: Easing.inOut(Easing.quad),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							transform: 'perspective(100px)',
							width: '100%',
							willChange: 'transform',
						}}
					/>

					{product.discount === null ? null : (
						<Interactive.Div
							name="Promotion"
							style={{
								backgroundColor: '#1d1d19',
								color: '#f7c900',
								fontSize: 20,
								fontWeight: 700,
								letterSpacing: -0.3,
								lineHeight: 1,
								maxWidth: 132,
								overflow: 'hidden',
								padding: '10px 12px',
								position: 'absolute',
								right: 0,
								textOverflow: 'ellipsis',
								textTransform: 'uppercase',
								top: 0,
								whiteSpace: 'nowrap',
							}}
						>
							{product.discount}
						</Interactive.Div>
					)}
				</div>

				<div
					style={{
						boxSizing: 'border-box',
						display: 'flex',
						flex: 1,
						flexDirection: 'column',
						paddingBottom: 24,
						paddingLeft: slotPosition > 0 ? obscuredSidePadding : 22,
						paddingRight: slotPosition < 0 ? obscuredSidePadding : 22,
						paddingTop: 22,
					}}
				>
					<Interactive.H3
						name="Product title"
						style={{
							WebkitBoxOrient: 'vertical',
							WebkitLineClamp: 3,
							display: '-webkit-box',
							fontSize: 32,
							fontWeight: 700,
							height: 98,
							letterSpacing: -1.4,
							lineHeight: 0.98,
							margin: 0,
							overflow: 'hidden',
							overflowWrap: 'anywhere',
							textTransform: 'uppercase',
							textWrap: 'balance',
						}}
					>
						{product.title}
					</Interactive.H3>

					<div
						style={{
							alignItems: 'baseline',
							display: 'flex',
							fontVariantNumeric: 'tabular-nums',
							gap: 10,
							height: 48,
							marginTop: 'auto',
							minWidth: 0,
						}}
					>
						<Interactive.Div
							name="Current price"
							style={{
								fontSize: 48,
								fontWeight: 700,
								letterSpacing: -2.3,
								lineHeight: 1,
								maxWidth: 148,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{product.price}
						</Interactive.Div>

						{product.originalPrice === null ? null : (
							<Interactive.Div
								name="Original price"
								style={{
									color: '#7b776e',
									fontSize: 22,
									fontWeight: 500,
									maxWidth: 74,
									overflow: 'hidden',
									textDecoration: 'line-through',
									textDecorationThickness: 1.5,
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{product.originalPrice}
							</Interactive.Div>
						)}
					</div>
				</div>
			</Interactive.Div>
		</div>
	);
};

export const ProductCollection = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Container"
			style={{
				WebkitFontSmoothing: 'antialiased',
				backgroundColor: '#f2f3f4',
				boxSizing: 'border-box',
				color: '#1d1d19',
				fontFamily: 'Inter',
				height: '100%',
				isolation: 'isolate',
				opacity: interpolate(
					frame,
					[0, 10, durationInFrames - 8, durationInFrames - 1],
					[0, 1, 1, 0],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				overflow: 'hidden',
				position: 'relative',
				scale: interpolate(
					frame,
					[0, 16, durationInFrames - 8, durationInFrames - 1],
					[0.97, 1, 1, 0.98],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
				transform: 'perspective(100px)',
				translate: interpolate(
					frame,
					[0, 16, durationInFrames - 8, durationInFrames - 1],
					['0px 30px', '0px 0px', '0px 0px', '0px -20px'],
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
			<div
				style={{
					left: 0,
					position: 'absolute',
					right: 0,
					top: 112,
					zIndex: 300,
				}}
			>
				<Interactive.H2
					name="Collection title"
					style={{
						fontSize: 80,
						fontWeight: 700,
						letterSpacing: -4.6,
						lineHeight: 0.92,
						margin: 0,
						opacity: interpolate(frame, [4, 22], [0, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						textAlign: 'center',
						textTransform: 'uppercase',
						textWrap: 'balance',
						transform: 'perspective(100px)',
						translate: interpolate(frame, [4, 22], ['0px 24px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						willChange: 'transform, opacity',
					}}
				>
					Featured Products
				</Interactive.H2>
			</div>

			{products.map((product, index) => (
				<ProductCard
					key={product.title}
					count={products.length}
					index={index}
					product={product}
				/>
			))}
		</Interactive.Div>
	);
};
