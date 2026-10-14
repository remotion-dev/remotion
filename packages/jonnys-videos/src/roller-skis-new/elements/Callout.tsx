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

type CalloutIcon = 'check' | 'warning' | 'cross';

type CalloutProps = InteractiveTransformProps & {
	readonly label: string;
	readonly text: string;
	readonly icon: CalloutIcon;
	readonly accentColor: string;
};

const iconPaths: Record<CalloutIcon, string> = {
	check: 'M14 25 L21 32 L34 17',
	warning: 'M24 13 L24 27 M24 34 L24 35',
	cross: 'M16 16 L32 32 M32 16 L16 32',
};

const CalloutInner: React.FC<CalloutProps> = ({
	label,
	text,
	icon,
	accentColor,
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Callout"
			showInTimeline={false}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 22,
				padding: '16px 40px 16px 16px',
				borderRadius: 999,
				backgroundColor: 'white',
				boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35)',
				fontFamily,
				whiteSpace: 'nowrap',
				transformOrigin: 'left center',
				scale: interpolate(
					frame,
					[0, 12, durationInFrames - 8, durationInFrames],
					[0.4, 1, 1, 0.85],
					{
						easing: [
							Easing.spring({damping: 12}),
							Easing.linear,
							Easing.in(Easing.cubic),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
				opacity: interpolate(
					frame,
					[0, 4, durationInFrames - 6, durationInFrames],
					[0, 1, 1, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
				...style,
			}}
		>
			<svg width={84} height={84} viewBox="0 0 48 48">
				<circle cx="24" cy="24" r="24" fill={accentColor} />
				<path
					d={iconPaths[icon]}
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={interpolate(frame, [6, 16], [1, 0], {
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					fill="none"
					stroke="white"
					strokeWidth={5}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div
					style={{
						color: accentColor,
						fontSize: 28,
						fontWeight: 800,
						letterSpacing: 4,
						textTransform: 'uppercase',
					}}
				>
					{label}
				</div>
				<div
					style={{
						color: '#18181b',
						fontSize: 50,
						fontWeight: 800,
						letterSpacing: -1,
						lineHeight: 1.1,
					}}
				>
					{text}
				</div>
			</div>
		</Interactive.Div>
	);
};

const calloutSchema = {
	label: {type: 'string', default: 'Feature', description: 'Label'},
	text: {type: 'string', default: 'Text', description: 'Text'},
	icon: {
		type: 'enum',
		default: 'check',
		description: 'Icon',
		variants: {check: {}, warning: {}, cross: {}},
	},
	accentColor: {
		type: 'color',
		default: '#16a34a',
		description: 'Accent color',
	},
} as const satisfies InteractivitySchema;

export const Callout = Interactive.withSchema({
	Component: CalloutInner,
	componentName: '<Callout>',
	schema: calloutSchema,
	wrapInSequence: true,
});
