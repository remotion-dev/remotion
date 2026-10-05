import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700'],
});

type ProductCardProps = {
	readonly count: number;
	readonly index: number;
	readonly label: string;
};

const ProductCard: React.FC<ProductCardProps> = ({count, index, label}) => {
	const frame = useCurrentFrame();
	const {durationInFrames: cardDurationInFrames} = useVideoConfig();
	const lastProductIndex = Math.max(0, count - 1);
	const rawScrollPosition = interpolate(
		frame,
		[24, cardDurationInFrames - 28],
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

	return (
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
				style={{
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
				<Interactive.Div
					name="Card label"
					style={{
						alignItems: 'center',
						color: '#ffffff',
						display: 'flex',
						fontFamily: 'sans-serif',
						fontSize: 160,
						fontWeight: 900,
						height: '100%',
						justifyContent: 'center',
						letterSpacing: -8,
						overflow: 'hidden',
						position: 'relative',
						textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
					}}
				>
					<Img
						alt=""
						name="Card background"
						showInTimeline={false}
						src={
							index === 1
								? 'https://remotion.media/transition-bg-pink.jpg'
								: 'https://remotion.media/transition-bg-blue.jpg'
						}
						style={{
							filter: index === 2 ? 'hue-rotate(-65deg)' : 'none',
							height: '100%',
							objectFit: 'cover',
							position: 'absolute',
							width: '100%',
						}}
					/>
					<div style={{position: 'relative'}}>{label}</div>
				</Interactive.Div>
			</div>
		</div>
	);
};

const ProductCollectionInner: React.FC<InteractiveTransformProps> = ({
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill style={style} showInTimeline={false}>
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
						[0, 10, durationInFrames - 8, durationInFrames - 1],
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
						[0, 16, durationInFrames - 8, durationInFrames - 1],
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
						[0, 16, durationInFrames - 8, durationInFrames - 1],
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
				<ProductCard count={3} index={0} label="A" />
				<ProductCard count={3} index={1} label="B" />
				<ProductCard count={3} index={2} label="C" />
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const ProductCollection = Interactive.withSchema({
	Component: ProductCollectionInner,
	componentName: '<ProductCollection>',
	schema: {},
	wrapInSequence: true,
});
