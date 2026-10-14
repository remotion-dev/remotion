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

type LocationLowerThirdProps = InteractiveTransformProps & {
	readonly location: string;
	readonly time: string;
	readonly accentColor: string;
};

const LocationLowerThirdInner: React.FC<LocationLowerThirdProps> = ({
	location,
	time,
	accentColor,
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Container"
			showInTimeline={false}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				fontFamily,
				...style,
			}}
		>
			<Interactive.Svg
				name="Location pin"
				viewBox="0 0 64 80"
				style={{
					width: 78,
					height: 98,
					overflow: 'visible',
					filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35))',
					opacity: interpolate(
						frame,
						[0, 9, durationInFrames - 12, durationInFrames - 1],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
					translate: interpolate(
						frame,
						[0, 16, durationInFrames - 14, durationInFrames - 1],
						['0px -14px', '0px 0px', '0px 0px', '0px -10px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<path
					d="M32 3C15.4 3 4 15.4 4 31C4 50.8 22.1 69.6 29.3 76.2C30.8 77.6 33.2 77.6 34.7 76.2C41.9 69.6 60 50.8 60 31C60 15.4 48.6 3 32 3Z"
					pathLength="1"
					fill={accentColor}
					fillOpacity={interpolate(
						frame,
						[5, 18, durationInFrames - 15, durationInFrames - 6],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}
					stroke="white"
					strokeDasharray="1"
					strokeDashoffset={interpolate(
						frame,
						[0, 16, durationInFrames - 15, durationInFrames - 4],
						[1, 0, 0, 1],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="3"
				/>
				<circle
					cx="32"
					cy="30"
					r={interpolate(
						frame,
						[10, 21, durationInFrames - 18, durationInFrames - 8],
						[0, 9, 9, 0],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					fill="white"
				/>
			</Interactive.Svg>
			<Interactive.Div
				name="Label"
				cropRight={interpolate(
					frame,
					[10, 30, durationInFrames - 28, durationInFrames - 10],
					[1, 0, 0, 1],
					{
						easing: [
							Easing.bezier(0.65, 0, 0.35, 1),
							Easing.linear,
							Easing.bezier(0.65, 0, 0.35, 1),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					padding: '16px 18px 16px 30px',
					borderRadius: 999,
					backgroundColor: 'white',
					boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
					whiteSpace: 'nowrap',
				}}
			>
				<div
					style={{
						color: '#18181b',
						fontSize: 50,
						fontWeight: 800,
						letterSpacing: -1,
					}}
				>
					{location}
				</div>
				<div
					style={{
						padding: '8px 18px',
						borderRadius: 999,
						backgroundColor: accentColor,
						color: 'white',
						fontSize: 34,
						fontWeight: 700,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{time}
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const locationLowerThirdSchema = {
	location: {type: 'string', default: 'Zürich', description: 'Location'},
	time: {type: 'string', default: '08:00', description: 'Time'},
	accentColor: {
		type: 'color',
		default: '#2563eb',
		description: 'Accent color',
	},
} as const satisfies InteractivitySchema;

export const LocationLowerThird = Interactive.withSchema({
	Component: LocationLowerThirdInner,
	componentName: '<LocationLowerThird>',
	schema: locationLowerThirdSchema,
	wrapInSequence: true,
});
