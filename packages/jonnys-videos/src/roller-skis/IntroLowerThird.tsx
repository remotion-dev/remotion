import type React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	type InteractivitySchema,
} from 'remotion';

type IntroLowerThirdProps = {
	readonly nameText: string;
	readonly roleText: string;
	readonly style?: React.CSSProperties;
};

const IntroLowerThirdContent: React.FC<IntroLowerThirdProps> = ({
	nameText,
	roleText,
	style,
}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Presenter card"
			style={{
				position: 'absolute',
				left: 70,
				top: 70,
				backgroundColor: 'white',
				fontFamily: 'GT Planar, Arial, Helvetica, sans-serif',
				fontFeatureSettings: "'ss03' 1",
				padding: '24px 44px',
				borderRadius: 18,
				boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
				translate: interpolate(
					frame,
					[0, 8, 31, 84, 107],
					[
						'-600px -300px',
						'-600px -300px',
						'0px 0px',
						'0px 0px',
						'-600px -300px',
					],
					{
						easing: [
							Easing.linear,
							Easing.spring({damping: 200}),
							Easing.linear,
							Easing.spring({damping: 200}),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				rotate: interpolate(
					frame,
					[0, 8, 31, 84, 107],
					['-5.4deg', '-5.4deg', '0deg', '0deg', '-5.4deg'],
					{
						easing: [
							Easing.linear,
							Easing.spring({damping: 200}),
							Easing.linear,
							Easing.spring({damping: 200}),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				...style,
			}}
		>
			<Interactive.Div
				name="Presenter name"
				style={{fontSize: 50, fontWeight: 700, color: '#111'}}
				from={38}
				premountFor={30}
			>
				{nameText}
			</Interactive.Div>
			<Interactive.Div
				name="Presenter role"
				style={{
					fontSize: 36,
					fontWeight: 400,
					marginTop: 8,
					color: '#4290f5',
				}}
			>
				{roleText}
			</Interactive.Div>
		</Interactive.Div>
	);
};

const lowerThirdSchema = {
	nameText: {
		type: 'text-content',
		default: 'Jonny Burger',
		description: 'Name',
	},
	roleText: {
		type: 'text-content',
		default: 'Roller Ski Enthusiast',
		description: 'Role',
	},
} as const satisfies InteractivitySchema;

export const IntroLowerThird = Interactive.withSchema({
	Component: IntroLowerThirdContent,
	componentName: '<IntroLowerThird>',
	schema: lowerThirdSchema,
	wrapInSequence: true,
});
