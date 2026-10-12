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

type NameLowerThirdProps = InteractiveTransformProps & {
	readonly personName: string;
	readonly title: string;
	readonly accentColor: string;
};

const NameLowerThirdInner: React.FC<NameLowerThirdProps> = ({
	personName,
	title,
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
				flexDirection: 'column',
				alignItems: 'flex-start',
				fontFamily,
				...style,
			}}
		>
			<Interactive.Div
				name="Name bar"
				cropRight={interpolate(
					frame,
					[0, 20, durationInFrames - 24, durationInFrames - 4],
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
					height: 84,
					padding: '0 30px',
					backgroundColor: accentColor,
					color: '#ffffff',
					fontSize: 50,
					fontWeight: 800,
					whiteSpace: 'nowrap',
				}}
			>
				{personName}
			</Interactive.Div>
			<Interactive.Div
				name="Title bar"
				cropRight={interpolate(
					frame,
					[4, 24, durationInFrames - 28, durationInFrames - 8],
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
					height: 62,
					padding: '0 30px',
					backgroundColor: '#18181b',
					color: '#ffffff',
					fontSize: 34,
					fontWeight: 700,
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</Interactive.Div>
		</Interactive.Div>
	);
};

const nameLowerThirdSchema = {
	personName: {type: 'string', default: 'Name', description: 'Name'},
	title: {type: 'string', default: 'Title', description: 'Title'},
	accentColor: {
		type: 'color',
		default: '#2563eb',
		description: 'Accent color',
	},
} as const satisfies InteractivitySchema;

export const NameLowerThird = Interactive.withSchema({
	Component: NameLowerThirdInner,
	componentName: '<NameLowerThird>',
	schema: nameLowerThirdSchema,
	wrapInSequence: true,
});
