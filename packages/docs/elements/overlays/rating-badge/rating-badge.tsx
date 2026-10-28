import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700', '800'],
});

const StarIcon: React.FC<{
	fillPercentage?: number;
	size?: number;
}> = ({fillPercentage = 1, size = 26}) => {
	const id = React.useId();
	const gradientId = `star-grad-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

	return (
		<svg
			aria-hidden="true"
			height={size}
			style={{
				display: 'inline-block',
				flexShrink: 0,
			}}
			viewBox="0 0 24 24"
			width={size}
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
					<stop offset={`${fillPercentage * 100}%`} stopColor="#f59e0b" />
					<stop offset={`${fillPercentage * 100}%`} stopColor="#d1d5db" />
				</linearGradient>
			</defs>
			<path
				d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
				fill={`url(#${gradientId})`}
			/>
		</svg>
	);
};

const VerifiedBadgeIcon: React.FC<{size?: number}> = ({size = 20}) => {
	return (
		<svg
			aria-hidden="true"
			height={size}
			style={{
				display: 'inline-block',
				flexShrink: 0,
			}}
			viewBox="0 0 20 20"
			width={size}
		>
			<circle cx="10" cy="10" fill="#10b981" r="10" />
			<path
				d="M6 10.2l2.8 2.8 5.4-5.4"
				fill="none"
				stroke="#ffffff"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.2"
			/>
		</svg>
	);
};

const RatingBadgeInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const entranceProgress = spring({
		frame,
		fps,
		config: {
			damping: 14,
			mass: 0.8,
			stiffness: 120,
		},
	});

	const exitProgress = interpolate(
		frame,
		[durationInFrames - 16, durationInFrames - 2],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.4, 0, 1, 1),
		},
	);

	const containerScale =
		interpolate(entranceProgress, [0, 1], [0.85, 1]) *
		(1 - exitProgress * 0.15);
	const containerTranslateY =
		interpolate(entranceProgress, [0, 1], [24, 0]) + exitProgress * 18;
	const containerOpacity =
		interpolate(entranceProgress, [0, 1], [0, 1]) * (1 - exitProgress);

	const starDelays = [4, 7, 10, 13, 16];

	return (
		<Interactive.Div
			name="Container"
			showInTimeline={false}
			style={{
				alignItems: 'center',
				backgroundColor: '#ffffff',
				border: '1.5px solid #e4e4e7',
				borderRadius: 9999,
				boxShadow:
					'0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'row',
				fontFamily: 'Inter',
				height: 84,
				opacity: containerOpacity,
				padding: '0 28px',
				position: 'relative',
				transform: `translateY(${containerTranslateY}px) scale(${containerScale})`,
				transformOrigin: '50% 50%',
				width: 580,
				willChange: 'transform, opacity',
				...style,
			}}
		>
			<Interactive.Div
				name="Star rating group"
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					gap: 4,
				}}
			>
				{starDelays.map((delay, index) => {
					const starEntrance = spring({
						frame: frame - delay,
						fps,
						config: {
							damping: 10,
							mass: 0.5,
							stiffness: 180,
						},
					});

					const starScale = interpolate(starEntrance, [0, 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					return (
						<div
							key={index}
							style={{
								transform: `scale(${starScale})`,
								transformOrigin: '50% 50%',
							}}
						>
							<StarIcon fillPercentage={index === 4 ? 0.9 : 1} size={26} />
						</div>
					);
				})}
			</Interactive.Div>

			<Interactive.Div
				name="Score text"
				style={{
					alignItems: 'baseline',
					display: 'flex',
					flexDirection: 'row',
					gap: 4,
					marginLeft: 14,
				}}
			>
				<span
					style={{
						color: '#09090b',
						fontSize: 28,
						fontWeight: 800,
						letterSpacing: '-0.02em',
						lineHeight: 1,
					}}
				>
					4.9
				</span>
				<span
					style={{
						color: '#71717a',
						fontSize: 19,
						fontWeight: 500,
						lineHeight: 1,
					}}
				>
					/ 5.0
				</span>
			</Interactive.Div>

			<div
				style={{
					backgroundColor: '#e4e4e7',
					height: 32,
					margin: '0 20px',
					width: 1,
				}}
			/>

			<Interactive.Div
				name="Verified customer count"
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					gap: 8,
				}}
			>
				<VerifiedBadgeIcon size={20} />
				<span
					style={{
						color: '#27272a',
						fontSize: 21,
						fontWeight: 600,
						letterSpacing: '-0.01em',
						lineHeight: 1,
						whiteSpace: 'nowrap',
					}}
				>
					2,400+ Reviews
				</span>
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const RatingBadge = Interactive.create({
	Component: RatingBadgeInner,
	componentName: '<RatingBadge>',
});
