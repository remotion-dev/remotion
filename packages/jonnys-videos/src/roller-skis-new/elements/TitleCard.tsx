import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';
import {fontFamily} from './font';

type TitleCardProps = {
	readonly line1: string;
	readonly line2: string;
	readonly kicker: string;
	readonly accentColor: string;
};

const TitleCardInner: React.FC<TitleCardProps> = ({
	line1,
	line2,
	kicker,
	accentColor,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily,
			}}
		>
			<AbsoluteFill
				name="Shade"
				style={{
					background:
						'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%)',
					opacity: interpolate(
						frame,
						[0, 4, durationInFrames - 8, durationInFrames],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<Interactive.Div
				name="Title"
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					scale: interpolate(
						frame,
						[0, 10, durationInFrames - 8, durationInFrames],
						[1.25, 1, 1.03, 1.12],
						{
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					opacity: interpolate(
						frame,
						[0, 3, durationInFrames - 6, durationInFrames],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<div
					style={{
						color: 'white',
						fontSize: 44,
						fontWeight: 700,
						letterSpacing: 14,
						textTransform: 'uppercase',
						textShadow: '0 4px 20px rgba(0,0,0,0.5)',
						marginBottom: 18,
						opacity: interpolate(frame, [6, 14], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					{kicker}
				</div>
				<div
					style={{
						color: 'white',
						fontSize: 200,
						fontWeight: 900,
						lineHeight: 0.95,
						letterSpacing: -4,
						textTransform: 'uppercase',
						textShadow: '0 10px 40px rgba(0,0,0,0.45)',
					}}
				>
					{line1}
				</div>
				<div
					style={{
						position: 'relative',
						marginTop: 14,
						padding: '0px 36px',
					}}
				>
					<Interactive.Div
						name="Marker"
						cropRight={interpolate(frame, [3, 14], [1, 0], {
							easing: Easing.bezier(0.65, 0, 0.35, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: accentColor,
							borderRadius: 18,
							rotate: '-1.5deg',
						}}
					/>
					<div
						style={{
							position: 'relative',
							color: 'white',
							fontSize: 200,
							fontWeight: 900,
							lineHeight: 1.05,
							letterSpacing: -4,
							textTransform: 'uppercase',
						}}
					>
						{line2}
					</div>
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

const titleCardSchema = {
	line1: {type: 'string', default: 'Roller ski', description: 'First line'},
	line2: {type: 'string', default: 'Commute', description: 'Second line'},
	kicker: {type: 'string', default: '', description: 'Kicker'},
	accentColor: {
		type: 'color',
		default: '#2563eb',
		description: 'Accent color',
	},
} as const satisfies InteractivitySchema;

export const TitleCard = Interactive.withSchema({
	Component: TitleCardInner,
	componentName: '<TitleCard>',
	schema: titleCardSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
