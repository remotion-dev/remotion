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

type SpeedBadgeProps = InteractiveTransformProps & {
	readonly speed: string;
};

const SpeedBadgeInner: React.FC<SpeedBadgeProps> = ({speed, style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Speed badge"
			showInTimeline={false}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				padding: '14px 30px 14px 24px',
				borderRadius: 999,
				backgroundColor: 'rgba(0, 0, 0, 0.55)',
				color: 'white',
				fontFamily,
				fontSize: 52,
				fontWeight: 800,
				fontVariantNumeric: 'tabular-nums',
				opacity: interpolate(
					frame,
					[0, 4, durationInFrames - 4, durationInFrames],
					[0, 1, 1, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
				translate: interpolate(frame, [0, 8], ['0px -20px', '0px 0px'], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				...style,
			}}
		>
			<svg width={56} height={40} viewBox="0 0 56 40">
				<path d="M2 2 L26 20 L2 38 Z M28 2 L52 20 L28 38 Z" fill="white" />
			</svg>
			{speed}
		</Interactive.Div>
	);
};

const speedBadgeSchema = {
	speed: {type: 'string', default: '2×', description: 'Speed'},
} as const satisfies InteractivitySchema;

export const SpeedBadge = Interactive.withSchema({
	Component: SpeedBadgeInner,
	componentName: '<SpeedBadge>',
	schema: speedBadgeSchema,
	wrapInSequence: true,
});
