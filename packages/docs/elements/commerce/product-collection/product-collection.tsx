import {loadFont} from '@remotion/google-fonts/Inter';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Easing,
	Img,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700'],
});

export const productCollectionDurationInFrames = 150;

type ProductCardProps = InteractiveBaseProps &
	Omit<InteractiveTransformProps, 'style'> & {
		readonly count: number;
		readonly discount: string;
		readonly image: string;
		readonly index: number;
		readonly originalPrice: string;
		readonly price: string;
		readonly style: React.CSSProperties | null;
		readonly title: string;
	};

const productCardSchema = {
	...Interactive.baseSchema,
	title: {
		type: 'text-content',
		default: 'Product title',
		description: 'Product title',
	},
	image: {
		type: 'asset',
		assetType: 'image',
		default:
			'https://remotion.media/elements/product-collection-cloudline-runner.png',
		description: 'Product image',
	},
	price: {
		type: 'text-content',
		default: '$100',
		description: 'Current price',
	},
	originalPrice: {
		type: 'text-content',
		default: '',
		description: 'Original price (leave empty to hide)',
	},
	discount: {
		type: 'text-content',
		default: '',
		description: 'Promotion (leave empty to hide)',
	},
	count: {type: 'hidden'},
	index: {type: 'hidden'},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ProductCardInner = forwardRef<
	HTMLDivElement,
	ProductCardProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			controls,
			count,
			discount,
			image,
			index,
			name,
			originalPrice,
			price,
			style,
			title,
			...sequenceProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		const frame = useCurrentFrame();
		const lastProductIndex = Math.max(0, count - 1);
		const rawScrollPosition = interpolate(
			frame,
			[24, productCollectionDurationInFrames - 28],
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
		const y =
			Math.min(distanceFromCenter, 1.3) * 36 + (1 - entryProgress) * 180;
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

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? '<ProductCard>'}
				outlineRef={outlineRef}
			>
				<div
					style={{
						height: 560,
						left: 300,
						top: 40,
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
					<div
						ref={outlineRef}
						style={{
							...style,
							backgroundColor: '#ffffff',
							borderRadius: 6,
							boxShadow: '0 2px 6px rgba(29, 29, 25, 0.12)',
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
								height: 335,
								overflow: 'hidden',
								position: 'relative',
								width: '100%',
							}}
						>
							<Img
								alt={title}
								name="Product image"
								showInTimeline={false}
								src={image}
								style={{
									height: '100%',
									objectFit: 'cover',
									objectPosition: '50% 50%',
									scale: interpolate(
										frame,
										[0, productCollectionDurationInFrames - 1],
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

							{discount.trim() === '' ? null : (
								<div
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
									{discount}
								</div>
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
							<h3
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
									width: 230,
								}}
							>
								{title}
							</h3>

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
								<div
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
									{price}
								</div>

								{originalPrice.trim() === '' ? null : (
									<div
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
										{originalPrice}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</Sequence>
		);
	},
);

const ProductCard = Interactive.withSchema({
	Component: ProductCardInner,
	componentName: '<ProductCard>',
	componentIdentity: null,
	schema: productCardSchema,
	supportsEffects: false,
}) as React.FC<ProductCardProps>;

export const ProductCollection = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				WebkitFontSmoothing: 'antialiased',
				boxSizing: 'border-box',
				color: '#1d1d19',
				fontFamily: 'Inter',
				height: 660,
				isolation: 'isolate',
				left: 60,
				opacity: interpolate(
					frame,
					[
						0,
						10,
						productCollectionDurationInFrames - 8,
						productCollectionDurationInFrames - 1,
					],
					[0, 1, 1, 0],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				overflow: 'hidden',
				position: 'absolute',
				scale: interpolate(
					frame,
					[
						0,
						16,
						productCollectionDurationInFrames - 8,
						productCollectionDurationInFrames - 1,
					],
					[0.97, 1, 1, 0.98],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
				top: 180,
				transform: 'perspective(100px)',
				translate: interpolate(
					frame,
					[
						0,
						16,
						productCollectionDurationInFrames - 8,
						productCollectionDurationInFrames - 1,
					],
					['0px 30px', '0px 0px', '0px 0px', '0px -20px'],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: 900,
				willChange: 'transform, opacity',
			}}
		>
			<ProductCard
				count={5}
				discount="20% off"
				image="https://remotion.media/elements/product-collection-cloudline-runner.png"
				index={0}
				name="Cloudline Runner card"
				originalPrice="$148"
				price="$118"
				style={{translate: '0px 0px'}}
				title="Cloudline Runner"
			/>
			<ProductCard
				count={5}
				discount=""
				image="https://remotion.media/elements/product-collection-minimal-steel-watch.png"
				index={1}
				name="Minimal Steel Watch card"
				originalPrice=""
				price="$185"
				style={{translate: '0px 0px'}}
				title="Minimal Steel Watch"
			/>
			<ProductCard
				count={5}
				discount="Save $31"
				image="https://images.unsplash.com/photo-1511499767150-a48a237f0083?fm=jpg&fit=crop&w=900&q=90"
				index={2}
				name="Studio Sunglasses card"
				originalPrice="$125"
				price="$94"
				style={{translate: '0px 0px'}}
				title="Studio Sunglasses"
			/>
			<ProductCard
				count={5}
				discount="New"
				image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&fit=crop&w=900&q=90"
				index={3}
				name="Studio Headset card"
				originalPrice=""
				price="$179"
				style={{translate: '0px 0px'}}
				title="Studio Headset"
			/>
			<ProductCard
				count={5}
				discount=""
				image="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?fm=jpg&fit=crop&w=900&q=90"
				index={4}
				name="Sculptural Table Lamp card"
				originalPrice=""
				price="$149"
				style={{translate: '0px 0px'}}
				title="Sculptural Table Lamp"
			/>
		</Interactive.Div>
	);
};
