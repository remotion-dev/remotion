import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';
import {fontFamily} from './font';

type AwardBadgeProps = InteractiveTransformProps & {
	readonly award: string;
	readonly winner: string;
};

const AwardBadgeInner: React.FC<AwardBadgeProps> = ({award, winner, style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Award"
			showInTimeline={false}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 26,
				padding: '22px 44px 22px 24px',
				borderRadius: 32,
				background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
				boxShadow: '0 18px 50px rgba(0, 0, 0, 0.4)',
				fontFamily,
				whiteSpace: 'nowrap',
				scale: interpolate(
					frame,
					[0, 14, durationInFrames - 8, durationInFrames],
					[0.3, 1, 1, 0.8],
					{
						easing: [
							Easing.spring({damping: 10}),
							Easing.linear,
							Easing.in(Easing.cubic),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
				rotate: interpolate(
					frame,
					[0, 6, 12, 18],
					['-12deg', '6deg', '-3deg', '0deg'],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				opacity: interpolate(
					frame,
					[0, 3, durationInFrames - 6, durationInFrames],
					[0, 1, 1, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
				...style,
			}}
		>
			<svg width={110} height={110} viewBox="0 0 64 64">
				<circle cx="32" cy="32" r="32" fill="#78350f" />
				<path
					d="M22 16 H42 V26 C42 32 38 36 32 36 C26 36 22 32 22 26 Z"
					fill="#fde68a"
				/>
				<path
					d="M22 19 H15 C15 26 18 29 23 29 M42 19 H49 C49 26 46 29 41 29"
					fill="none"
					stroke="#fde68a"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				<rect x="29" y="36" width="6" height="7" fill="#fde68a" />
				<rect x="22" y="43" width="20" height="6" rx="2" fill="#fde68a" />
			</svg>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div
					style={{
						color: '#78350f',
						fontSize: 30,
						fontWeight: 800,
						letterSpacing: 5,
						textTransform: 'uppercase',
					}}
				>
					{award}
				</div>
				<div
					style={{
						color: '#1c1917',
						fontSize: 72,
						fontWeight: 900,
						letterSpacing: -2,
						lineHeight: 1,
					}}
				>
					{winner}
				</div>
			</div>
		</Interactive.Div>
	);
};

const awardBadgeSchema = {
	award: {type: 'string', default: 'Award', description: 'Award'},
	winner: {type: 'string', default: 'Winner', description: 'Winner'},
} as const satisfies InteractivitySchema;

export const AwardBadge = Interactive.withSchema({
	Component: AwardBadgeInner,
	componentName: '<AwardBadge>',
	schema: awardBadgeSchema,
	wrapInSequence: true,
});
