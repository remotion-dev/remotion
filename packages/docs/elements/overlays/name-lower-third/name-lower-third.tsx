import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '700'],
});

const NameLowerThirdInner: React.FC<InteractiveTransformProps> = ({style}) => {
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
				width: 534,
				height: 132,
				boxSizing: 'border-box',
				fontFamily: 'Inter',
				...style,
			}}
		>
			<Interactive.Div
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
				name="Name bar"
				style={{
					display: 'flex',
					alignItems: 'center',
					height: 66,
					boxSizing: 'border-box',
					padding: '0 24px',
					overflow: 'hidden',
					backgroundColor: '#2563eb',
					color: '#ffffff',
					fontSize: 34,
					fontWeight: 700,
					letterSpacing: 1,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				Alex Morgan
			</Interactive.Div>
			<Interactive.Div
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
				name="Title bar"
				style={{
					display: 'flex',
					alignItems: 'center',
					height: 66,
					boxSizing: 'border-box',
					padding: '0 24px',
					overflow: 'hidden',
					backgroundColor: '#18181b',
					color: '#ffffff',
					fontSize: 34,
					fontWeight: 700,
					letterSpacing: 1,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				Creative Developer
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const NameLowerThird = Interactive.withSchema({
	Component: NameLowerThirdInner,
	componentName: '<NameLowerThird>',
	schema: {},
	wrapInSequence: true,
});
